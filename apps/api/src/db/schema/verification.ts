import { pgEnum } from 'drizzle-orm/pg-core';

export const verificationStatusEnum = pgEnum(
    'verification_status',
    [
        'PENDING',
        'APPROVED',
        'REJECTED',
        'SUSPENDED',
    ],
);