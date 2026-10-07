import {
    check,
    index,
    integer,
    pgTable,
    text,
    timestamp,
    uniqueIndex,
    uuid,
} from 'drizzle-orm/pg-core';

import { users } from './user';
import { restaurants } from './restaurants';
import { orders } from './orders';
import { driverProfiles } from './driver';
import { sql } from 'drizzle-orm';

export const reviews = pgTable(
    'reviews',
    {
        id: uuid('id')
            .primaryKey()
            .defaultRandom(),

        customerId: uuid('customer_id')
            .notNull()
            .references(() => users.id),

        restaurantId: uuid('restaurant_id')
            .notNull()
            .references(() => restaurants.id),

        orderId: uuid('order_id')
            .notNull()
            .references(() => orders.id),

        driverId: uuid('driver_id')
            .references(() => driverProfiles.id, {
                onDelete: 'set null',
            }),

        restaurantRating: integer('restaurant_rating')
            .notNull(),

        driverRating: integer('driver_rating'),

        comment: text('comment'),

        createdAt: timestamp('created_at')
            .defaultNow()
            .notNull(),

        updatedAt: timestamp('updated_at')
            .defaultNow()
            .notNull(),
    },
    (table) => [
        uniqueIndex('reviews_order_customer_unique')
            .on(table.orderId, table.customerId),

        index('reviews_restaurant_idx')
            .on(table.restaurantId),

        index('reviews_driver_idx')
            .on(table.driverId),

        check(
            'reviews_restaurant_rating_check',
            sql`${table.restaurantRating} >= 1 AND ${table.restaurantRating} <= 5`,
        ),

        check(
            'reviews_driver_rating_check',
            sql`${table.driverRating} IS NULL OR (${table.driverRating} >= 1 AND ${table.driverRating} <= 5)`,
        ),
    ],
);

export type Review = typeof reviews.$inferSelect;
export type NewReview = typeof reviews.$inferInsert;