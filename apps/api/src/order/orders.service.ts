import { BadRequestException, ForbiddenException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import type { Database } from "../db";
import { menuItems, orderItems, orders, restaurants } from "../db/schema";
import { and, desc, eq, inArray, SQL } from "drizzle-orm";
import { CreateOrderDto } from "./dto/create-orderdto";
import { JwtPayload, OrderStatusType, UserRole } from "@food-delivery/types";
import { OrdersGateway } from "../gateway/orders.gateway";
import { DriverService } from "../driver/driver.service";

@Injectable()
export class OrdersService {
    constructor(
        @Inject('DB')
        private readonly db: Database,
        private ordersGateway: OrdersGateway,
        private driverService: DriverService
    ) { }

    async create(customerId: string, dto: CreateOrderDto) {

        //1. Validate that the order contains item

        if (!dto.items?.length) {
            throw new BadRequestException("Order must contain at least one item")
        }

        //2. Prevent duplicate menu items

        const menuItemIds = dto.items.map((item) => item.menuItemId);
        const uniqueMenuItemIds = new Set(menuItemIds)
        if (uniqueMenuItemIds.size !== menuItemIds.length) {
            throw new BadRequestException("Duplicate menu items are not allowed")
        }

        //3.  fetch all menu items in one query
        const menuItemsArr = await this.db.select().from(menuItems).where(inArray(menuItems.id, menuItemIds));

        // 4. Make sure every menu item exists
        if (menuItemsArr.length !== menuItemIds.length) {
            throw new BadRequestException('One or more menu items not found');
        }

        //5. Make sure all items belong to the restaurant
        const allBelongToRestaurant = menuItemsArr.every(
            (item) => item.restaurantId === dto.restaurantId
        );
        if (!allBelongToRestaurant) {
            throw new BadRequestException('All menu items must belong to the specified restaurant');
        }

        // 6. Create a quick lookup map

        const menuItemMap = new Map(menuItemsArr.map((item) => [item.id, item,]),);

        // 7. Calculate total on the server

        const total = dto.items.reduce((sum, item) => {
            const menuItem = menuItemMap.get(item.menuItemId,);
            if (!menuItem) {
                throw new BadRequestException(`Menu item ${item.menuItemId} not found`,);
            }
            const price = Number(menuItem.price);
            const quantity = item.quantity;
            return sum + price * quantity;
        }, 0,);


        // 8. Create order + order items in one transaction

        const order = await this.db.transaction(
            async (tx) => {
                // Create the order 
                const [newOrder] = await tx
                    .insert(orders).values({
                        customerId,
                        restaurantId: dto.restaurantId,
                        deliveryAddress: dto.deliveryAddress,
                        totalAmount: total.toFixed(2),
                        status: "PENDING",
                    })
                    .returning();

                // Create order items
                await tx.insert(orderItems).values(
                    dto.items.map((item) => {
                        const menuItem = menuItemMap.get(item.menuItemId)!;
                        return {
                            orderId: newOrder.id,
                            menuItemId: item.menuItemId,
                            quantity: item.quantity,
                            // Snapshot the price 
                            // // at the time of ordering 
                            unitPrice: menuItem.price,
                        };
                    }),
                );
                return newOrder;
            },
        );
        return order;


        //////////////////////

    }

    async findByCustomer(customerId: string) {
        return this.findOrdersWithDetails(eq(orders.customerId, customerId))
    }
    async findByDriver(driverId: string) {
        return this.findOrdersWithDetails(eq(orders.driverId, driverId))
    }
    //routes to customer or driver query based on JWT role
    async findMyOrders(userId: string, role: string) {
        if (role === UserRole.DRIVER) {
            return this.findByDriver(userId);
        }
        return this.findByCustomer(userId)
    }

    async findById(
        id: string,
        user: JwtPayload,
    ) {
        // Find the order
        const [order] = await this.db
            .select()
            .from(orders)
            .where(eq(orders.id, id));

        if (!order) {
            throw new NotFoundException("Order not found");
        }

        // Check whether the authenticated user
        // is allowed to view this order.
        const canView =
            (user.role === UserRole.CUSTOMER &&
                order.customerId === user.sub) ||

            (user.role === UserRole.RESTAURANT_OWNER &&
                await this.isOwnerOfRestaurant(
                    user.sub,
                    order.restaurantId,
                )) ||

            (user.role === UserRole.DRIVER &&
                order.driverId === user.sub);

        if (!canView) {
            // Don't reveal whether the order exists.
            throw new NotFoundException("Order not found");
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
        const [restaurant] = await this.db.select()
            .from(restaurants)
            .where(eq(restaurants.ownerId, ownerId))

        if (!restaurant) throw new NotFoundException('Restaurant not found')

        return this.findOrdersWithDetails(eq(orders.restaurantId, restaurant.id))
    }

    async updateStatus(
        orderId: string,
        newStatus: OrderStatusType,
        user: JwtPayload
    ) {
        const [order] = await this.db
            .select()
            .from(orders)
            .where(eq(orders.id, orderId));
        if (!order) throw new NotFoundException('Order not found')
        this.validateTransition(order.status, newStatus, user.role);

        if (user.role === UserRole.RESTAURANT_OWNER) {
            const [restaurant] = await this.db.select()
                .from(restaurants)
                .where(eq(restaurants.ownerId, user.sub))

            if (!restaurant || restaurant.id !== order.restaurantId) {
                throw new ForbiddenException(
                    'This order does not belong to your restaurant'
                )
            }

        }
        if (user.role === UserRole.DRIVER && order.driverId !== user.sub) {
            throw new ForbiddenException(
                'This order is not assigned to you'
            )
        }

        const [updated] = await this.db.update(orders)
            .set({ status: newStatus, updatedAt: new Date() })
            .where(eq(orders.id, orderId))
            .returning();

        this.ordersGateway.emitOrderUpdate(updated)

        if (newStatus === "READY") {
            await this.driverService.assignDriver(orderId)
        }
        return updated


    }


    private validateTransition(
        currentStatus: string,
        newStatus: OrderStatusType,
        role: string
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
            role === UserRole.RESTAURANT_OWNER ? (ownerTransitions[currentStatus] ?? []) :
                role === UserRole.DRIVER ? (driverTransitions[currentStatus] ?? [])
                    : [];

        if (!allowed.includes(newStatus)) {
            throw new BadRequestException(
                `Cannot transition from ${currentStatus} to ${newStatus}`
            )
        }

    }


    private async isOwnerOfRestaurant(
        ownerId: string,
        restaurantId: string,
    ) {
        const [restaurant] = await this.db
            .select({
                id: restaurants.id,
            })
            .from(restaurants)
            .where(
                and(
                    eq(restaurants.id, restaurantId),
                    eq(restaurants.ownerId, ownerId),
                ),
            );

        return !!restaurant;
    }


    private async enrichOrders(
        orderRows: (typeof orders.$inferSelect)[]
    ) {
        if (orderRows.length === 0) return [];
        const orderIds = orderRows.map((o) => o.id);
        const restaurantIds = [
            ...new Set(orderRows.map((o) => o.restaurantId)),

        ];
        const restaurantArr = await this.db.select({
            id: restaurants.id,
            name: restaurants.name
        }).from(restaurants)
            .where(inArray(restaurants.id, restaurantIds))

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
            items: items.filter((i) => i.orderId === order.id)
        }))
    }


    // shared fetch: filter orders, sort newest first, enrich with relations
    private async findOrdersWithDetails(where: SQL) {
        const orderRows = await this.db.select()
            .from(orders)
            .where(where)
            .orderBy(desc(orders.createdAt))

        return this.enrichOrders(orderRows)
    }
}


