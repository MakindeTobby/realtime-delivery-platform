import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { lte, sql } from 'drizzle-orm';
import { createHash } from 'node:crypto';
import type { Database } from '../db';
import { authRateLimits } from '../db/schema';

@Injectable()
export class AuthRateLimitService {
  private lastCleanupAt = 0;

  constructor(
    @Inject('DB') private readonly db: Database,
    private readonly configService: ConfigService,
  ) {}

  async consume(
    scope: string,
    identity: string,
    maxAttempts: number,
    windowSeconds: number,
  ) {
    const now = new Date();
    const nextResetAt = new Date(now.getTime() + windowSeconds * 1000);
    const key = createHash('sha256')
      .update(`${scope}\0${identity}`)
      .digest('hex');

    const [bucket] = await this.db
      .insert(authRateLimits)
      .values({ key, count: 1, resetAt: nextResetAt })
      .onConflictDoUpdate({
        target: authRateLimits.key,
        set: {
          count: sql`CASE WHEN ${authRateLimits.resetAt} <= ${now} THEN 1 ELSE ${authRateLimits.count} + 1 END`,
          resetAt: sql`CASE WHEN ${authRateLimits.resetAt} <= ${now} THEN ${nextResetAt} ELSE ${authRateLimits.resetAt} END`,
          updatedAt: now,
        },
      })
      .returning({ count: authRateLimits.count, resetAt: authRateLimits.resetAt });

    await this.cleanupExpiredBuckets(now);

    return {
      allowed: bucket.count <= maxAttempts,
      retryAfterSeconds: Math.max(
        1,
        Math.ceil((bucket.resetAt.getTime() - now.getTime()) / 1000),
      ),
    };
  }

  getLimit(setting: string, defaultValue: number) {
    const configured = this.configService.get<string | number>(setting);
    return configured === undefined ? defaultValue : Number(configured);
  }

  private async cleanupExpiredBuckets(now: Date) {
    if (now.getTime() - this.lastCleanupAt < 60 * 60 * 1000) return;

    this.lastCleanupAt = now.getTime();
    try {
      await this.db
        .delete(authRateLimits)
        .where(lte(authRateLimits.resetAt, now));
    } catch {
      this.lastCleanupAt = 0;
    }
  }
}
