import {
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { createHash, randomInt } from 'crypto';
import { and, desc, eq, isNull } from 'drizzle-orm';

import { type Database } from '../db';
import { emailVerifications, users } from '../db/schema';

@Injectable()
export class EmailVerificationService {
  private readonly logger = new Logger(EmailVerificationService.name);

  constructor(
    @Inject('DB')
    private readonly db: Database,
  ) {}
  private readonly CODE_EXPIRY_MINUTES = 10;

  private generateCode(): string {
    return randomInt(100000, 1000000).toString();
  }

  private hashCode(code: string): string {
    return createHash('sha256').update(code).digest('hex');
  }

  async sendVerificationCode(userId: string): Promise<VerificationDelivery> {
    const [user] = await this.db
      .select({
        id: users.id,
        email: users.email,
        emailVerified: users.emailVerified,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      throw new InternalServerErrorException('User not found');
    }

    if (user.emailVerified) {
      throw new ConflictException('Email is already verified');
    }

    const code = this.generateCode();
    const codeHash = this.hashCode(code);

    const expiresAt = new Date(
      Date.now() + this.CODE_EXPIRY_MINUTES * 60 * 1000,
    );
    await this.db
      .update(emailVerifications)
      .set({
        usedAt: new Date(),
      })
      .where(
        and(
          eq(emailVerifications.userId, user.id),
          isNull(emailVerifications.usedAt),
        ),
      );
    await this.db.insert(emailVerifications).values({
      userId: user.id,
      codeHash,
      expiresAt,
    });

    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.EMAIL_FROM;
    if (!apiKey || !from) {
      if (process.env.NODE_ENV !== 'production') {
        this.logger.warn(
          `Email provider is not configured; development verification code for ${user.email}: ${code}`,
        );
        return { status: 'development' };
      }

      this.logger.error('Email verification is not configured');
      return { status: 'unavailable' };
    }

    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from,
          to: [user.email],
          subject: 'Verify your email address',
          html: `<p>Your verification code is:</p><p style="font-size:24px;font-weight:bold;letter-spacing:4px">${code}</p><p>This code expires in ${this.CODE_EXPIRY_MINUTES} minutes. If you did not create an account, you can ignore this email.</p>`,
          text: `Your verification code is ${code}. It expires in ${this.CODE_EXPIRY_MINUTES} minutes.`,
        }),
      });

      if (!response.ok) {
        this.logger.error(`Email provider returned ${response.status}`);
        return { status: 'unavailable' };
      }

      return { status: 'sent' };
    } catch (error) {
      this.logger.error('Could not send email verification code', error);
      return { status: 'unavailable' };
    }
  }

  async verifyEmail(email: string, code: string): Promise<void> {
    const [user] = await this.db
      .select({
        id: users.id,
        emailVerified: users.emailVerified,
      })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) {
      throw new ConflictException('Invalid verification request');
    }

    if (user.emailVerified) {
      throw new ConflictException('Email is already verified');
    }

    const [verification] = await this.db
      .select()
      .from(emailVerifications)
      .where(eq(emailVerifications.userId, user.id))
      .orderBy(desc(emailVerifications.createdAt))
      .limit(1);

    if (!verification) {
      throw new ConflictException('No verification code found');
    }

    if (verification.usedAt) {
      throw new ConflictException('Verification code has already been used');
    }

    if (verification.expiresAt < new Date()) {
      throw new ConflictException('Verification code has expired');
    }

    if (verification.attempts >= 5) {
      throw new ConflictException('Too many verification attempts');
    }

    const codeHash = this.hashCode(code);

    if (codeHash !== verification.codeHash) {
      await this.db
        .update(emailVerifications)
        .set({
          attempts: verification.attempts + 1,
        })
        .where(eq(emailVerifications.id, verification.id));

      throw new ConflictException('Invalid verification code');
    }

    await this.db.transaction(async (tx) => {
      await tx
        .update(emailVerifications)
        .set({
          usedAt: new Date(),
        })
        .where(eq(emailVerifications.id, verification.id));

      await tx
        .update(users)
        .set({
          emailVerified: true,
          updatedAt: new Date(),
        })
        .where(eq(users.id, user.id));
    });
  }

  async resendVerificationCode(email: string): Promise<VerificationDelivery> {
    const [user] = await this.db
      .select({
        id: users.id,
        email: users.email,
        emailVerified: users.emailVerified,
      })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) {
      return { status: 'unavailable' };
    }

    if (user.emailVerified) {
      return { status: 'already-verified' };
    }

    const [latestVerification] = await this.db
      .select({
        createdAt: emailVerifications.createdAt,
      })
      .from(emailVerifications)
      .where(eq(emailVerifications.userId, user.id))
      .orderBy(desc(emailVerifications.createdAt))
      .limit(1);

    if (latestVerification) {
      const cooldownMs = 60 * 1000;
      const elapsedMs = Date.now() - latestVerification.createdAt.getTime();

      if (elapsedMs < cooldownMs) {
        return { status: 'cooldown' };
      }
    }

    return this.sendVerificationCode(user.id);
  }
}

export type VerificationDelivery = {
  status: 'sent' | 'development' | 'unavailable' | 'already-verified' | 'cooldown';
};
