import {
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

import { users } from './user';

export const emailVerifications = pgTable(
  'email_verifications',
  {
    id: uuid('id').primaryKey().defaultRandom(),

    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),

    codeHash: text('code_hash').notNull(),

    expiresAt: timestamp('expires_at').notNull(),

    attempts: integer('attempts').notNull().default(0),

    usedAt: timestamp('used_at'),

    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('email_verifications_user_idx').on(table.userId),
    index('email_verifications_expires_idx').on(table.expiresAt),
  ],
);
