import {
    boolean,
    index,
    pgTable,
    text,
    timestamp,
    uuid,
} from 'drizzle-orm/pg-core';

import { users } from './user';
import { verificationStatusEnum } from './verification';

export const restaurants = pgTable(
    'restaurants',
    {
        id: uuid('id')
            .primaryKey()
            .defaultRandom(),

        ownerId: uuid('owner_id')
            .notNull()
            .references(() => users.id),

        name: text('name')
            .notNull(),

        description: text('description'),

        imageUrl: text('image_url'),

        address: text('address')
            .notNull(),

        city: text('city')
            .notNull(),

        cuisineType: text('cuisine_type')
            .notNull(),

        verificationStatus:
            verificationStatusEnum('verification_status')
                .notNull()
                .default('PENDING'),

        isOpen: boolean('is_open')
            .notNull()
            .default(false),

        createdAt: timestamp('created_at')
            .defaultNow()
            .notNull(),

        updatedAt: timestamp('updated_at')
            .defaultNow()
            .notNull(),
    },
    (table) => [
        index('restaurants_owner_idx')
            .on(table.ownerId),

        index('restaurants_verification_status_idx')
            .on(table.verificationStatus),
    ],
);

export type Restaurant =
    typeof restaurants.$inferSelect;

export type NewRestaurant =
    typeof restaurants.$inferInsert;