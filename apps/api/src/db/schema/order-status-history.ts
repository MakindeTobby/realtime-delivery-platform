import { index, pgTable, timestamp, uuid } from 'drizzle-orm/pg-core';

import { users } from './user';
import { orders, orderStatusEnum } from './orders';

export const orderStatusHistory = pgTable(
  'order_status_history',
  {
    id: uuid('id').primaryKey().defaultRandom(),

    orderId: uuid('order_id')
      .notNull()
      .references(() => orders.id, {
        onDelete: 'cascade',
      }),

    status: orderStatusEnum('status').notNull(),

    changedBy: uuid('changed_by').references(() => users.id, {
      onDelete: 'set null',
    }),

    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('order_status_history_order_idx').on(table.orderId),

    index('order_status_history_created_idx').on(table.createdAt),
  ],
);

export type OrderStatusHistory = typeof orderStatusHistory.$inferSelect;

export type NewOrderStatusHistory = typeof orderStatusHistory.$inferInsert;
