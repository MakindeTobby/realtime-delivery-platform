import {
  index,
  integer,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

import { users } from './user';
import { restaurants } from './restaurants';
import { driverProfiles } from './driver';
import { menuItems } from './menus';

export const orderStatusEnum = pgEnum('order_status', [
  'PENDING',
  'CONFIRMED',
  'PREPARING',
  'READY',
  'PICKED_UP',
  'DELIVERED',
  'CANCELLED',
]);

export const paymentStatusEnum = pgEnum('payment_status', [
  'PENDING',
  'PAID',
  'FAILED',
  'REFUNDED',
]);

export const orders = pgTable(
  'orders',
  {
    id: uuid('id').primaryKey().defaultRandom(),

    customerId: uuid('customer_id')
      .notNull()
      .references(() => users.id),

    restaurantId: uuid('restaurant_id')
      .notNull()
      .references(() => restaurants.id),

    driverId: uuid('driver_id').references(() => driverProfiles.id, {
      onDelete: 'set null',
    }),

    status: orderStatusEnum('status').notNull().default('PENDING'),

    paymentStatus: paymentStatusEnum('payment_status')
      .notNull()
      .default('PENDING'),

    totalAmount: numeric('total_amount', {
      precision: 10,
      scale: 2,
    }).notNull(),

    deliveryAddress: text('delivery_address').notNull(),

    deliveryCity: text('delivery_city').notNull(),

    deliveryLatitude: numeric('delivery_latitude', {
      precision: 10,
      scale: 7,
    }),

    deliveryLongitude: numeric('delivery_longitude', {
      precision: 10,
      scale: 7,
    }),

    stripePaymentIntentId: text('stripe_payment_intent_id'),

    createdAt: timestamp('created_at').defaultNow().notNull(),

    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    index('orders_customer_idx').on(table.customerId),

    index('orders_restaurant_idx').on(table.restaurantId),

    index('orders_driver_idx').on(table.driverId),

    index('orders_status_idx').on(table.status),

    index('orders_payment_status_idx').on(table.paymentStatus),
  ],
);

export const orderItems = pgTable(
  'order_items',
  {
    id: uuid('id').primaryKey().defaultRandom(),

    orderId: uuid('order_id')
      .notNull()
      .references(() => orders.id, {
        onDelete: 'cascade',
      }),

    menuItemId: uuid('menu_item_id').references(() => menuItems.id, {
      onDelete: 'set null',
    }),

    itemName: text('item_name').notNull(),

    unitPrice: numeric('unit_price', {
      precision: 10,
      scale: 2,
    }).notNull(),

    quantity: integer('quantity').notNull(),

    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('order_items_order_idx').on(table.orderId),

    index('order_items_menu_item_idx').on(table.menuItemId),
  ],
);
