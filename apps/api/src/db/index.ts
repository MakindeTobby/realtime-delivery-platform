// import { neon } from '@neondatabase/serverless';
// import { drizzle } from 'drizzle-orm/neon-http';

// import * as schema from './schema';

// const sql = neon(process.env.DATABASE_URL!);

// const db = drizzle({ client: sql });

// export type Database = typeof db;

import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
});

export const db = drizzle({ client: pool });

export type Database = typeof db;

export { pool };
