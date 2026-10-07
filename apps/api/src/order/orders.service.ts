import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Database } from '../db';
import {
  driverProfiles,
  menuItems,
  orderItems,
  orders,
  orderStatusHistory,
  restaurants,
  users,
} from '../db/schema';
import { and, desc, eq, inArray, SQL } from 'drizzle-orm';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtPayload, OrderStatusType, UserRole } from '@food-delivery/types';
import { OrdersGateway } from '../gateway/orders.gateway';
import { DriverService } from '../driver/driver.service';

@Injectable()
export class OrdersService {
  constructor(
    @Inject('DB')
    private readonly db: Database,
    private ordersGateway: OrdersGateway,
    private driverService: DriverService,
  ) {}

  async create(customerId: string, dto: CreateOrderDto) {
    // 0. Customer must have a verified email
    const [customer] = await this.db
      .select({
        id: users.id,
        emailVerified: users.emailVerified,
      })
      .from(users)
      .where(eq(users.id, customerId));

    if (!customer) {
      throw new NotFoundException('User not found');
    }

    if (!customer.emailVerified) {
      throw new ForbiddenException(
        'Please verify your email before placing an order',
      );
    }

    //1. Validate that the order contains item

    if (!dto.items?.length) {
      throw new BadRequestException('Order must contain at least one item');
    }
    const [restaurant] = await this.db
      .select({
        id: restaurants.id,
        verificationStatus: restaurants.verificationStatus,
        isOpen: restaurants.isOpen,
      })
      .from(restaurants)
      .where(eq(restaurants.id, dto.restaurantId));

    if (!restaurant) {
      throw new NotFoundException('Restaurant not found');
    }

    if (restaurant.verificationStatus !== 'APPROVED') {
      throw new BadRequestException('Restaurant is not available for orders');
    }

    if (!restaurant.isOpen) {
      throw new BadRequestException('Restaurant is currently closed');
    }

    //2. Prevent duplicate menu items

    const menuItemIds = dto.items.map((item) => item.menuItemId);
    const uniqueMenuItemIds = new Set(menuItemIds);
    if (uniqueMenuItemIds.size !== menuItemIds.length) {
      throw new BadRequestException('Duplicate menu items are not allowed');
    }

    //3.  fetch all menu items in one query
    const menuItemsArr = await this.db
      .select()
      .from(menuItems)
      .where(inArray(menuItems.id, menuItemIds));

    // 4. Make sure every menu item exists
    if (menuItemsArr.length !== menuItemIds.length) {
      throw new BadRequestException('One or more menu items not found');
    }

    const unavailableItem = menuItemsArr.find((item) => !item.isAvailable);

    if (unavailableItem) {
      throw new BadRequestException(
        `Menu item "${unavailableItem.name}" is currently unavailable`,
      );
    }

    //5. Make sure all items belong to the restaurant
    const allBelongToRestaurant = menuItemsArr.every(
      (item) => item.restaurantId === dto.restaurantId,
    );
    if (!allBelongToRestaurant) {
      throw new BadRequestException(
        'All menu items must belong to the specified restaurant',
      );
    }

    // 6. Create a quick lookup map

    const menuItemMap = new Map(menuItemsArr.map((item) => [item.id, item]));

    // 7. Calculate total on the server

    const total = dto.items.reduce((sum, item) => {
      const menuItem = menuItemMap.get(item.menuItemId);
      if (!menuItem) {
        throw new BadRequestException(`Menu item ${item.menuItemId} not found`);
      }
      const price = Number(menuItem.price);
      const quantity = item.quantity;
      return sum + price * quantity;
    }, 0);

    // 8. Create order + order items in one transaction

    const order = await this.db.transaction(async (tx) => {
      // Create the order

      const [newOrder] = await tx
        .insert(orders)
        .values({
          customerId,
          restaurantId: dto.restaurantId,
          deliveryAddress: dto.deliveryAddress,
          deliveryCity: dto.deliveryCity,
          totalAmount: total.toFixed(2),
          status: 'PENDING',
        })
        .returning();

      // Create order items
      await tx.insert(orderItems).values(
        dto.items.map((item) => {
          const menuItem = menuItemMap.get(item.menuItemId)!;
          return {
            orderId: newOrder.id,
            menuItemId: item.menuItemId,
            itemName: menuItem.name,
            quantity: item.quantity,
            unitPrice: menuItem.price,
          };
        }),
      );
      return newOrder;
    });
    return order;

    //////////////////////
  }

  async findByCustomer(customerId: string) {
    return this.findOrdersWithDetails(eq(orders.customerId, customerId));
  }
  async findByDriver(driverId: string) {
    return this.findOrdersWithDetails(eq(orders.driverId, driverId));
  }
  //routes to customer or driver query based on JWT role
  async findMyOrders(userId: string, roles: UserRole[]) {
    if (roles.includes(UserRole.DRIVER)) {
      const [driver] = await this.db
        .select({ id: driverProfiles.id })
        .from(driverProfiles)
        .where(eq(driverProfiles.userId, userId));

      if (!driver) {
        throw new NotFoundException('Driver profile not found');
      }

      return this.findByDriver(driver.id);
    }

    return this.findByCustomer(userId);
  }
  async findById(id: string, user: JwtPayload) {
    // Find the order
    const [order] = await this.db
      .select()
      .from(orders)
      .where(eq(orders.id, id));

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Check whether the authenticated user
    // is allowed to view this order.
    const canView =
      (user.roles.includes(UserRole.CUSTOMER) &&
        order.customerId === user.sub) ||
      (user.roles.includes(UserRole.RESTAURANT_OWNER) &&
        (await this.isOwnerOfRestaurant(user.sub, order.restaurantId))) ||
      (user.roles.includes(UserRole.DRIVER) &&
        (await this.isDriverAssignedToOrder(user.sub, order.driverId)));
    if (!canView) {
      // Don't reveal whether the order exists.
      throw new NotFoundException('Order not found');
    }

    // Fetch all items belonging to this order.
    const items = await this.db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, id));

    return {
      ...order,
      items,
    };
  }

  async findByRestaurant(ownerId: string) {
    const ownedRestaurants = await this.db
      .select({ id: restaurants.id })
      .from(restaurants)
      .where(eq(restaurants.ownerId, ownerId));

    if (ownedRestaurants.length === 0) {
      throw new NotFoundException('Restaurant not found');
    }

    const restaurantIds = ownedRestaurants.map((restaurant) => restaurant.id);

    return this.findOrdersWithDetails(
      inArray(orders.restaurantId, restaurantIds),
    );
  }

  async updateStatus(
    orderId: string,
    newStatus: OrderStatusType,
    user: JwtPayload,
  ) {
    const result = await this.db.transaction(async (tx) => {
      const [order] = await tx
        .select()
        .from(orders)
        .where(eq(orders.id, orderId));

      if (!order) {
        throw new NotFoundException('Order not found');
      }

      const actingRole = user.roles.includes(UserRole.RESTAURANT_OWNER)
        ? UserRole.RESTAURANT_OWNER
        : UserRole.DRIVER;

      this.validateTransition(order.status, newStatus, actingRole);

      if (user.roles.includes(UserRole.RESTAURANT_OWNER)) {
        const [restaurant] = await tx
          .select({ id: restaurants.id })
          .from(restaurants)
          .where(
            and(
              eq(restaurants.id, order.restaurantId),
              eq(restaurants.ownerId, user.sub),
            ),
          );

        if (!restaurant) {
          throw new ForbiddenException(
            'This order does not belong to your restaurant',
          );
        }
      }

      if (user.roles.includes(UserRole.DRIVER)) {
        const [driver] = await tx
          .select({ id: driverProfiles.id })
          .from(driverProfiles)
          .where(eq(driverProfiles.userId, user.sub));

        if (!driver || driver.id !== order.driverId) {
          throw new ForbiddenException('This order is not assigned to you');
        }
      }

      const [updated] = await tx
        .update(orders)
        .set({
          status: newStatus,
          updatedAt: new Date(),
        })
        .where(and(eq(orders.id, orderId), eq(orders.status, order.status)))
        .returning();

      if (!updated) {
        throw new BadRequestException(
          'Order status changed before this update could be completed',
        );
      }

      await tx.insert(orderStatusHistory).values({
        orderId: updated.id,
        status: updated.status,
        changedBy: user.sub,
      });

      return updated;
    });

    this.ordersGateway.emitOrderUpdate(result);

    if (newStatus === 'READY') {
      await this.driverService.assignDriver(orderId);
    }

    return result;
  }
  private validateTransition(
    currentStatus: string,
    newStatus: OrderStatusType,
    role: string,
  ) {
    const ownerTransitions: Record<string, string[]> = {
      CONFIRMED: ['PREPARING', 'CANCELLED'],
      PREPARING: ['READY', 'CANCELLED'],
    };
    const driverTransitions: Record<string, string[]> = {
      READY: ['PICKED_UP'],
      PICKED_UP: ['DELIVERED'],
    };
    const allowed =
      role === UserRole.RESTAURANT_OWNER
        ? (ownerTransitions[currentStatus] ?? [])
        : role === UserRole.DRIVER
          ? (driverTransitions[currentStatus] ?? [])
          : [];

    if (!allowed.includes(newStatus)) {
      throw new BadRequestException(
        `Cannot transition from ${currentStatus} to ${newStatus}`,
      );
    }
  }
  private async isDriverAssignedToOrder(
    userId: string,
    driverId: string | null,
  ) {
    if (!driverId) {
      return false;
    }

    const [driver] = await this.db
      .select({ id: driverProfiles.id })
      .from(driverProfiles)
      .where(eq(driverProfiles.userId, userId));

    return driver?.id === driverId;
  }
  private async isOwnerOfRestaurant(ownerId: string, restaurantId: string) {
    const [restaurant] = await this.db
      .select({
        id: restaurants.id,
      })
      .from(restaurants)
      .where(
        and(eq(restaurants.id, restaurantId), eq(restaurants.ownerId, ownerId)),
      );

    return !!restaurant;
  }

  private async enrichOrders(orderRows: (typeof orders.$inferSelect)[]) {
    if (orderRows.length === 0) return [];
    const orderIds = orderRows.map((o) => o.id);
    const restaurantIds = [...new Set(orderRows.map((o) => o.restaurantId))];
    const restaurantArr = await this.db
      .select({
        id: restaurants.id,
        name: restaurants.name,
      })
      .from(restaurants)
      .where(inArray(restaurants.id, restaurantIds));

    const items = await this.db
      .select()
      .from(orderItems)
      .where(inArray(orderItems.orderId, orderIds));

    const restaurantMap = Object.fromEntries(
      restaurantArr.map((r) => [r.id, r]),
    );
    return orderRows.map((order) => ({
      ...order,
      restaurant: restaurantMap[order.restaurantId],
      items: items.filter((i) => i.orderId === order.id),
    }));
  }

  // shared fetch: filter orders, sort newest first, enrich with relations
  private async findOrdersWithDetails(where: SQL) {
    const orderRows = await this.db
      .select()
      .from(orders)
      .where(where)
      .orderBy(desc(orders.createdAt));

    return this.enrichOrders(orderRows);
  }
}
