import {
    boolean,
    index,
    numeric,
    pgTable,
    text,
    timestamp,
    uuid,
} from 'drizzle-orm/pg-core';

import { restaurants } from './restaurants';

export const menuCategories = pgTable(
    'menu_categories',
    {
        id: uuid('id')
            .primaryKey()
            .defaultRandom(),

        restaurantId: uuid('restaurant_id')
            .notNull()
            .references(() => restaurants.id, {
                onDelete: 'cascade',
            }),

        name: text('name')
            .notNull(),

        createdAt: timestamp('created_at')
            .defaultNow()
            .notNull(),

        updatedAt: timestamp('updated_at')
            .defaultNow()
            .notNull(),
    },
    (table) => [
        index('menu_categories_restaurant_idx')
            .on(table.restaurantId),
    ],
);

export const menuItems = pgTable(
    'menu_items',
    {
        id: uuid('id')
            .primaryKey()
            .defaultRandom(),

        categoryId: uuid('category_id')
            .notNull()
            .references(() => menuCategories.id, {
                onDelete: 'cascade',
            }),

        restaurantId: uuid('restaurant_id')
            .notNull()
            .references(() => restaurants.id, {
                onDelete: 'cascade',
            }),

        name: text('name')
            .notNull(),

        description: text('description'),

        price: numeric('price', {
            precision: 10,
            scale: 2,
        }).notNull(),

        imageUrl: text('image_url'),

        isAvailable: boolean('is_available')
            .notNull()
            .default(true),

        createdAt: timestamp('created_at')
            .defaultNow()
            .notNull(),

        updatedAt: timestamp('updated_at')
            .defaultNow()
            .notNull(),
    },
    (table) => [
        index('menu_items_restaurant_idx')
            .on(table.restaurantId),

        index('menu_items_category_idx')
            .on(table.categoryId),
    ],
);

export type MenuCategory =
    typeof menuCategories.$inferSelect;

export type NewMenuCategory =
    typeof menuCategories.$inferInsert;

export type MenuItem =
    typeof menuItems.$inferSelect;

export type NewMenuItem =
    typeof menuItems.$inferInsert;