import { index, pgTable, timestamp, unique, uuid } from 'drizzle-orm/pg-core';

import { orders } from './orders';
import { driverProfiles } from './driver';

export const driverOrderDeclines = pgTable(
  'driver_order_declines',
  {
    id: uuid('id').primaryKey().defaultRandom(),

    orderId: uuid('order_id')
      .notNull()
      .references(() => orders.id, {
        onDelete: 'cascade',
      }),

    driverId: uuid('driver_id')
      .notNull()
      .references(() => driverProfiles.id, {
        onDelete: 'cascade',
      }),

    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    unique('driver_order_declines_order_driver_unique').on(
      table.orderId,
      table.driverId,
    ),

    index('driver_order_declines_order_idx').on(table.orderId),

    index('driver_order_declines_driver_idx').on(table.driverId),
  ],
);

export type DriverOrderDecline = typeof driverOrderDeclines.$inferSelect;

export type NewDriverOrderDecline = typeof driverOrderDeclines.$inferInsert;
