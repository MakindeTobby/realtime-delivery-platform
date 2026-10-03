import { numeric, pgEnum, pgTable, text, timestamp, uuid, integer } from "drizzle-orm/pg-core";
import { users } from "./user";
import { restaurants } from "./restaurants";
import { menuItems } from "./menus";


export const orderStatusEnum = pgEnum('order_status',
    ['PENDING',// Placed waiting for payment
        'CONFIRMED', // payment confirmed by stripe webhook
        'PREPARING', // Being prepared
        'READY', // Ready for pickup/delivery
        'PICKED_UP', // Picked up by driver
        'DELIVERED', // Delivered to customer
        'CANCELLED']); // Cancelled by user or restaurant

export const orders = pgTable('orders', {
    id: uuid('id').primaryKey().defaultRandom(),
    customerId: uuid('customer_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    restaurantId: uuid('restaurant_id').notNull().references(() => restaurants.id, { onDelete: 'cascade' }),
    driverId: uuid('driver_id').references(() => users.id, { onDelete: 'set null' }),
    status: orderStatusEnum('status').notNull().default('PENDING'),
    totalAmount: numeric('total_amount', { precision: 10, scale: 2 }).notNull(),
    deliveryAddress: text('delivery_address').notNull(),
    stripePaymentIntentId: text('stripe_payment_intent_id'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const orderItems = pgTable('order_items', {
    id: uuid('id').primaryKey().defaultRandom(),
    orderId: uuid('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
    menuItemId: uuid('menu_item_id').notNull().references(() => menuItems.id, { onDelete: 'cascade' }),
    quantity: integer('quantity').notNull(),
    unitPrice: numeric('unit_price', { precision: 10, scale: 2 }).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
export type OrderItem = typeof orderItems.$inferSelect;
export type NewOrderItem = typeof orderItems.$inferInsert;