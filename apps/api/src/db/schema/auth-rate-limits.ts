import { index, integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

export const authRateLimits = pgTable('auth_rate_limits', {
  key: text('key').primaryKey(),
  count: integer('count').notNull().default(0),
  resetAt: timestamp('reset_at').notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [index('auth_rate_limits_reset_at_idx').on(table.resetAt)]);
