import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import type { Database } from "../db";
import { OrdersGateway } from "../gateway/orders.gateway";
import { orders, users } from "../db/schema";
import { and, eq } from "drizzle-orm";
import { UserRole } from "@food-delivery/types";


@Injectable()
export class DriverService {
    constructor(
        @Inject('DB')
        private readonly db: Database,
        private ordersGateway: OrdersGateway
    ) { }

    async toggleOnline(driverId: string) {
        const [driver] = await this.db
            .select()
            .from(users)
            .where(eq(users.id, driverId))
        if (!driver) throw new NotFoundException('Driver not found')

        const [updated] = await this.db.update(users)
            .set({
                isOnline: !driver.isOnline
            }).where(
                eq(users.id, driverId)
            ).returning();

        return { isOnline: updated.isOnline }
    }

    async getStatus(driverId: string) {
        const [driver] = await this.db
            .select()
            .from(users)
            .where(eq(users.id, driverId))
        if (!driver) throw new NotFoundException('Driver not found');
        return { isOnline: driver.isOnline }
    }
    async assignDriver(orderId: string) {
        // In a real application we would be considering using GPS to get the closest driver to the order
        const [driver] = await this.db
            .select()
            .from(users)
            .where(
                and(
                    eq(users.role, UserRole.DRIVER),
                    eq(users.isOnline, true)
                )
            );
        if (!driver) {
            console.log(`No online drivers available for order:`, orderId);
            return null; // order stays READY, no driverId
        }

        const [updatedOrder] = await this.db
            .update(orders)
            .set({ driverId: driver.id, updatedAt: new Date() })
            .where(eq(orders.id, orderId)).returning();

        //push to driver:<driverId> room - driver app shows incoming order modal
        this.ordersGateway.emitDriverAssigned(driver.id, updatedOrder)
        return updatedOrder;
    }

    async declineOrder(orderId: string, driverId: string) {
        const [order] = await this.db.select()
            .from(orders)
            .where(eq(orders.id, orderId));
        if (!order) throw new NotFoundException('Order not found');
        if (order.driverId !== driverId) {
            throw new NotFoundException('Order not found')
        }

        // clear assignment
        await this.db
            .update(orders)
            .set({ driverId: null, updatedAt: new Date() })
            .where(eq(orders.id, orderId));
        // try to find another online driver
        await this.assignDriver(orderId);

        return { message: 'Order declined' }

    }
}