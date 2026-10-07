import {
  boolean,
  index,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

import { users } from './user';

export const userAddresses = pgTable(
  'user_addresses',
  {
    id: uuid('id').primaryKey().defaultRandom(),

    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, {
        onDelete: 'cascade',
      }),

    label: text('label').notNull(),

    address: text('address').notNull(),

    city: text('city').notNull(),

    latitude: numeric('latitude', {
      precision: 10,
      scale: 7,
    }),

    longitude: numeric('longitude', {
      precision: 10,
      scale: 7,
    }),

    isDefault: boolean('is_default').notNull().default(false),

    createdAt: timestamp('created_at').defaultNow().notNull(),

    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [index('user_addresses_user_idx').on(table.userId)],
);

export type UserAddress = typeof userAddresses.$inferSelect;

export type NewUserAddress = typeof userAddresses.$inferInsert;
