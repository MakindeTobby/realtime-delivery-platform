import { defineConfig } from 'drizzle-kit';

export default defineConfig({
    out: './drizzle',
    schema: [
        './src/db/schema/user.ts',
        './src/db/schema/restaurants.ts',
        './src/db/schema/menus.ts',
        './src/db/schema/orders.ts',
        './src/db/schema/reviews.ts',
        './src/db/schema/auth-sessions.ts',
        './src/db/schema/auth-rate-limits.ts',
    ],
    dialect: 'postgresql',
    dbCredentials: {
        url: process.env.DATABASE_URL!,
    },
});
