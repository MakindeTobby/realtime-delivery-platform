import {
    boolean,
    index,
    numeric,
    pgTable,
    timestamp,
    uuid,
} from 'drizzle-orm/pg-core';

import { users } from './user';
import { verificationStatusEnum } from './verification';

export const driverProfiles = pgTable(
    'driver_profiles',
    {
        id: uuid('id')
            .primaryKey()
            .defaultRandom(),

        userId: uuid('user_id')
            .notNull()
            .unique()
            .references(() => users.id, {
                onDelete: 'cascade',
            }),

        verificationStatus:
            verificationStatusEnum('verification_status')
                .notNull()
                .default('PENDING'),

        isOnline: boolean('is_online')
            .notNull()
            .default(false),

        createdAt: timestamp('created_at')
            .defaultNow()
            .notNull(),

        updatedAt: timestamp('updated_at')
            .defaultNow()
            .notNull(),
    },
);

export const driverLocations = pgTable(
    'driver_locations',
    {
        id: uuid('id')
            .primaryKey()
            .defaultRandom(),

        driverId: uuid('driver_id')
            .notNull()
            .references(() => driverProfiles.id, {
                onDelete: 'cascade',
            }),

        latitude: numeric('latitude', {
            precision: 10,
            scale: 7,
        }).notNull(),

        longitude: numeric('longitude', {
            precision: 10,
            scale: 7,
        }).notNull(),

        heading: numeric('heading', {
            precision: 6,
            scale: 2,
        }),

        speed: numeric('speed', {
            precision: 8,
            scale: 2,
        }),

        recordedAt: timestamp('recorded_at')
            .defaultNow()
            .notNull(),
    },
    (table) => [
        index('driver_locations_driver_recorded_idx')
            .on(table.driverId, table.recordedAt),
    ],
);