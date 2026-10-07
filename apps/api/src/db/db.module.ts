// import { Global, Module } from '@nestjs/common';
// import { neon } from '@neondatabase/serverless';
// import { drizzle } from 'drizzle-orm/neon-http';


// @Global()
// @Module({
//     providers: [
//         {
//             provide: 'DB',
//             useFactory: () => {
//                 const sql = neon(process.env.DATABASE_URL!);

//                 return drizzle({
//                     client: sql,

//                 });
//             },
//         },
//     ],
//     exports: ['DB'],
// })
// export class DbModule { }

import { Global, Module } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

@Global()
@Module({
    providers: [
        {
            provide: 'DB',
            useFactory: () => {
                const pool = new Pool({
                    connectionString: process.env.DATABASE_URL,
                });

                return drizzle({ client: pool });
            },
        },
    ],
    exports: ['DB'],
})
export class DbModule { }