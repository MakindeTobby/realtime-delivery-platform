import { boolean, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),

  firstName: text('first_name').notNull(),

  lastName: text('last_name').notNull(),

  email: text('email').notNull().unique(),

  password: text('password').notNull(),

  phone: text('phone'),
  emailVerified: boolean('email_verified').notNull().default(false),

  pushToken: text('push_token'),

  createdAt: timestamp('created_at').defaultNow().notNull(),

  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
