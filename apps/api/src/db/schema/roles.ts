import {
  pgEnum,
  pgTable,
  primaryKey,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

import { users } from './user';

export const userRoleEnum = pgEnum('user_role', [
  'CUSTOMER',
  'RESTAURANT_OWNER',
  'DRIVER',
  'ADMIN',
]);

export const userRoles = pgTable(
  'user_roles',
  {
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, {
        onDelete: 'cascade',
      }),

    role: userRoleEnum('role')
      .notNull(),

    createdAt: timestamp('created_at')
      .defaultNow()
      .notNull(),
  },
  (table) => [
    primaryKey({
      columns: [table.userId, table.role],
    }),
  ],
);

export type UserRoleRecord =
  typeof userRoles.$inferSelect;

export type NewUserRole =
  typeof userRoles.$inferInsert;