import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Database } from '../db';
import { OrdersGateway } from '../gateway/orders.gateway';
import {
  driverOrderDeclines,
  driverProfiles,
  orders,
  userRoles,
  users,
} from '../db/schema';
import { and, eq, inArray, isNotNull, isNull, not, sql } from 'drizzle-orm';
import { UserRole } from '@food-delivery/types';

@Injectable()
export class DriverService {
  constructor(
    @Inject('DB')
    private readonly db: Database,
    private ordersGateway: OrdersGateway,
  ) {}

  private async getDriverProfileByUserId(userId: string) {
    const [driver] = await this.db
      .select()
      .from(driverProfiles)
      .where(eq(driverProfiles.userId, userId));

    if (!driver) {
      throw new NotFoundException('Driver profile not found');
    }

    return driver;
  }
  async applyForDriver(userId: string) {
    return this.db.transaction(async (tx) => {
      const [user] = await tx
        .select({
          id: users.id,
          emailVerified: users.emailVerified,
        })
        .from(users)
        .where(eq(users.id, userId));

      if (!user) {
        throw new NotFoundException('User not found');
      }

      if (!user.emailVerified) {
        throw new ForbiddenException(
          'Please verify your email before applying as a driver',
        );
      }

      const [existingDriver] = await tx
        .select()
        .from(driverProfiles)
        .where(eq(driverProfiles.userId, userId));

      if (existingDriver) {
        return existingDriver;
      }

      const [driver] = await tx
        .insert(driverProfiles)
        .values({
          userId,
          verificationStatus: 'PENDING',
          isOnline: false,
        })
        .returning();

      await tx
        .insert(userRoles)
        .values({
          userId,
          role: UserRole.DRIVER,
        })
        .onConflictDoNothing();

      return driver;
    });
  }

  async toggleOnline(userId: string) {
    const driver = await this.getDriverProfileByUserId(userId);

    if (driver.verificationStatus !== 'APPROVED') {
      throw new ForbiddenException(
        'Driver must be approved before going online',
      );
    }

    const [updated] = await this.db
      .update(driverProfiles)
      .set({
        isOnline: !driver.isOnline,
        updatedAt: new Date(),
      })
      .where(eq(driverProfiles.id, driver.id))
      .returning();

    return { isOnline: updated.isOnline };
  }

  async getStatus(userId: string) {
    const driver = await this.getDriverProfileByUserId(userId);

    return { isOnline: driver.isOnline };
  }

  async assignDriver(orderId: string) {
    const assignment = await this.db.transaction(async (tx) => {
      const [order] = await tx
        .select()
        .from(orders)
        .where(eq(orders.id, orderId));

      if (!order) {
        throw new NotFoundException('Order not found');
      }

      if (order.driverId) {
        return null;
      }

      const declinedDrivers = await tx
        .select({
          driverId: driverOrderDeclines.driverId,
        })
        .from(driverOrderDeclines)
        .where(eq(driverOrderDeclines.orderId, orderId));

      const declinedDriverIds = declinedDrivers.map(({ driverId }) => driverId);

      const activeDriverRows = await tx
        .select({
          driverId: orders.driverId,
        })
        .from(orders)
        .where(
          and(
            inArray(orders.status, ['READY', 'PICKED_UP']),
            isNotNull(orders.driverId),
          ),
        );

      const busyDriverIds = activeDriverRows
        .map(({ driverId }) => driverId)
        .filter((driverId): driverId is string => driverId !== null);

      const conditions = [
        eq(userRoles.role, UserRole.DRIVER),
        eq(driverProfiles.verificationStatus, 'APPROVED'),
        eq(driverProfiles.isOnline, true),
      ];

      if (declinedDriverIds.length > 0) {
        conditions.push(not(inArray(driverProfiles.id, declinedDriverIds)));
      }

      if (busyDriverIds.length > 0) {
        conditions.push(not(inArray(driverProfiles.id, busyDriverIds)));
      }

      const candidates = await tx
        .select({
          driverId: driverProfiles.id,
          userId: users.id,
        })
        .from(driverProfiles)
        .innerJoin(users, eq(driverProfiles.userId, users.id))
        .innerJoin(userRoles, eq(userRoles.userId, users.id))
        .where(and(...conditions));

      for (const candidate of candidates) {
        await tx.execute(
          sql`SELECT pg_advisory_xact_lock(hashtext(${candidate.driverId})::bigint)`,
        );

        const [activeOrder] = await tx
          .select({
            id: orders.id,
          })
          .from(orders)
          .where(
            and(
              eq(orders.driverId, candidate.driverId),
              inArray(orders.status, ['READY', 'PICKED_UP']),
            ),
          )
          .limit(1);

        if (activeOrder) {
          continue;
        }

        const [updatedOrder] = await tx
          .update(orders)
          .set({
            driverId: candidate.driverId,
            updatedAt: new Date(),
          })
          .where(and(eq(orders.id, orderId), isNull(orders.driverId)))
          .returning();

        if (!updatedOrder) {
          return null;
        }

        return {
          order: updatedOrder,
          driverUserId: candidate.userId,
        };
      }

      console.log(`No eligible driver found for order ${orderId}`);

      return null;
    });

    if (!assignment) {
      return null;
    }

    this.ordersGateway.emitDriverAssigned(
      assignment.driverUserId,
      assignment.order,
    );

    return assignment.order;
  }

  async declineOrder(orderId: string, userId: string) {
    const driver = await this.getDriverProfileByUserId(userId);

    const releasedOrder = await this.db.transaction(async (tx) => {
      const [order] = await tx
        .select()
        .from(orders)
        .where(eq(orders.id, orderId));

      if (!order) {
        throw new NotFoundException('Order not found');
      }

      if (order.driverId !== driver.id) {
        throw new NotFoundException('Order is not assigned to this driver');
      }

      if (order.status !== 'READY') {
        throw new ForbiddenException('This order can no longer be declined');
      }

      const [released] = await tx
        .update(orders)
        .set({
          driverId: null,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(orders.id, orderId),
            eq(orders.driverId, driver.id),
            eq(orders.status, 'READY'),
          ),
        )
        .returning();

      if (!released) {
        throw new ForbiddenException('Order could not be declined');
      }

      await tx
        .insert(driverOrderDeclines)
        .values({
          orderId,
          driverId: driver.id,
        })
        .onConflictDoNothing();

      return released;
    });

    await this.assignDriver(releasedOrder.id);

    return {
      message: 'Order declined',
    };
  }
}
