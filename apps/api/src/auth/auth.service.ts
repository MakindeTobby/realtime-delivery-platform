import {
  ConflictException,
  Inject,
  Injectable,
  Logger,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { eq, gt, and, isNull, lte, sql } from 'drizzle-orm';
import {
  createHash,
  randomBytes,
  randomUUID,
  timingSafeEqual,
} from 'node:crypto';
import * as bcrypt from 'bcrypt';
import { JwtPayload, UserRole } from '@food-delivery/types';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import type { Database } from '../db';
import {
  authSessions,
  passwordResets,
  User,
  userRoles,
  users,
} from '../db/schema';
import {
  ACCESS_TOKEN_TTL_SECONDS,
  SESSION_TTL_SECONDS,
} from './session.constants';
import { EmailVerificationService } from './email-verification.service';

const PASSWORD_RESET_TTL_MS = 30 * 60 * 1000;
const PASSWORD_RESET_RESPONSE = {
  message:
    'If an account exists for that email, a password reset link has been sent.',
};

type SessionTokenPayload = JwtPayload & {
  sessionId: string;
  tokenType: 'access' | 'refresh';
};

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @Inject('DB')
    private readonly db: Database,
    private readonly jwtService: JwtService,
    private readonly emailVerificationService: EmailVerificationService,
  ) {}
  async register(dto: RegisterDto) {
    const [existing] = await this.db
      .select()
      .from(users)
      .where(eq(users.email, dto.email));

    if (existing) {
      throw new ConflictException('Email already in use');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.db.transaction(async (tx) => {
      const [newUser] = await tx
        .insert(users)
        .values({
          firstName: dto.firstName,
          lastName: dto.lastName,
          email: dto.email,
          password: hashedPassword,
          phone: dto.phone,
          emailVerified: false,
        })
        .returning();

      await tx.insert(userRoles).values({
        userId: newUser.id,
        role: UserRole.CUSTOMER,
      });

      return newUser;
    });
    await this.emailVerificationService.sendVerificationCode(user.id);

    return this.createSession(user);
  }

  async login(dto: LoginDto) {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.email, dto.email));
    if (!user) throw new UnauthorizedException('Invalid Credentials');

    const passwordMatch = await bcrypt.compare(dto.password, user.password);
    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid Credentials');
    }

    return this.createSession(user);
  }

  async refresh(dto: RefreshTokenDto) {
    const payload = await this.verifyRefreshToken(dto.refreshToken);
    const [session] = await this.db
      .select()
      .from(authSessions)
      .where(eq(authSessions.id, payload.sessionId));

    if (!session || session.userId !== payload.sub || session.revokedAt) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const now = new Date();
    if (session.expiresAt <= now) {
      await this.revokeSession(session.id, session.userId);
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const presentedHash = this.hashToken(dto.refreshToken);
    if (!this.hashesMatch(session.refreshTokenHash, presentedHash)) {
      // A previously rotated token was reused; revoke the session to contain replay.
      await this.revokeSession(session.id, session.userId);
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.id, session.userId));
    if (!user) {
      await this.revokeSession(session.id, session.userId);
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const tokenPair = await this.createTokenPair(
      user,
      session.id,
      session.expiresAt,
    );
    const [rotatedSession] = await this.db
      .update(authSessions)
      .set({
        refreshTokenHash: this.hashToken(tokenPair.refreshToken),
        updatedAt: now,
      })
      .where(
        and(
          eq(authSessions.id, session.id),
          eq(authSessions.refreshTokenHash, presentedHash),
          isNull(authSessions.revokedAt),
          gt(authSessions.expiresAt, now),
        ),
      )
      .returning({ id: authSessions.id });

    if (!rotatedSession) {
      await this.revokeSession(session.id, session.userId);
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    return { user: await this.sanitizeUser(user), ...tokenPair };
  }

  async logout(dto: RefreshTokenDto) {
    const payload = await this.verifyRefreshToken(dto.refreshToken);
    await this.revokeSession(payload.sessionId, payload.sub);
    return { success: true };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.EMAIL_FROM;
    const resetUrl = process.env.PASSWORD_RESET_URL;
    if (!apiKey || !from || !resetUrl) {
      throw new ServiceUnavailableException(
        'Password recovery email is not configured',
      );
    }

    const email = dto.email.trim();
    const [user] = await this.db
      .select()
      .from(users)
      .where(sql`lower(${users.email}) = lower(${email})`);
    if (!user) return PASSWORD_RESET_RESPONSE;

    const now = new Date();
    await this.db
      .update(passwordResets)
      .set({ usedAt: now })
      .where(
        and(eq(passwordResets.userId, user.id), isNull(passwordResets.usedAt)),
      );
    await this.db
      .delete(passwordResets)
      .where(lte(passwordResets.expiresAt, now));

    const token = randomBytes(32).toString('hex');
    const tokenHash = this.hashToken(token);
    const expiresAt = new Date(now.getTime() + PASSWORD_RESET_TTL_MS);
    await this.db
      .insert(passwordResets)
      .values({ userId: user.id, tokenHash, expiresAt });

    const link = new URL(resetUrl);
    link.searchParams.set('token', token);
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
          subject: 'Reset your password',
          html: `<p>We received a request to reset your password.</p><p><a href="${link.toString()}">Reset your password</a></p><p>This link expires in 30 minutes. If you did not request this, you can ignore this email.</p>`,
        }),
      });
      if (!response.ok)
        throw new Error(`Email provider returned ${response.status}`);
    } catch (error) {
      this.logger.error('Could not send password reset email', error);
    }

    return PASSWORD_RESET_RESPONSE;
  }

  async resetPassword(dto: ResetPasswordDto) {
    const now = new Date();
    const tokenHash = this.hashToken(dto.token);
    const [reset] = await this.db
      .update(passwordResets)
      .set({ usedAt: now })
      .where(
        and(
          eq(passwordResets.tokenHash, tokenHash),
          isNull(passwordResets.usedAt),
          gt(passwordResets.expiresAt, now),
        ),
      )
      .returning({ userId: passwordResets.userId });

    if (!reset)
      throw new UnauthorizedException(
        'Invalid or expired password reset token',
      );

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    await this.db
      .update(users)
      .set({ password: hashedPassword, updatedAt: now })
      .where(eq(users.id, reset.userId));
    await this.revokeAllSessionsForUser(reset.userId);

    return { message: 'Password has been reset. Please sign in again.' };
  }

  async getCurrentUser(userId: string) {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.id, userId));
    if (!user) throw new UnauthorizedException('Invalid or expired token');

    return await this.sanitizeUser(user);
  }

  /** Call after a password change to revoke every active device session. */
  async revokeAllSessionsForUser(userId: string) {
    await this.db
      .update(authSessions)
      .set({ revokedAt: new Date(), updatedAt: new Date() })
      .where(
        and(eq(authSessions.userId, userId), isNull(authSessions.revokedAt)),
      );
  }

  private async createSession(user: User) {
    const sessionId = randomUUID();
    const expiresAt = new Date(Date.now() + SESSION_TTL_SECONDS * 1000);
    const tokenPair = await this.createTokenPair(user, sessionId, expiresAt);

    await this.db.insert(authSessions).values({
      id: sessionId,
      userId: user.id,
      refreshTokenHash: this.hashToken(tokenPair.refreshToken),
      expiresAt,
    });

    return { user: await this.sanitizeUser(user), ...tokenPair };
  }

  private async createTokenPair(
    user: User,
    sessionId: string,
    expiresAt: Date,
  ) {
    const refreshExpirySeconds = Math.floor(
      (expiresAt.getTime() - Date.now()) / 1000,
    );
    if (refreshExpirySeconds <= 0) {
      throw new UnauthorizedException(
        'Session has expired; please sign in again',
      );
    }

    const claims = {
      sub: user.id,
      sessionId,
    };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync({ ...claims, tokenType: 'access' }),
      this.jwtService.signAsync(
        { ...claims, tokenType: 'refresh' },
        { expiresIn: refreshExpirySeconds },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
      accessTokenExpiresIn: ACCESS_TOKEN_TTL_SECONDS,
    };
  }

  private async verifyRefreshToken(
    token: string,
  ): Promise<SessionTokenPayload> {
    let payload: SessionTokenPayload;
    try {
      payload = await this.jwtService.verifyAsync<SessionTokenPayload>(token);
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    if (
      payload.tokenType !== 'refresh' ||
      typeof payload.sessionId !== 'string' ||
      typeof payload.sub !== 'string'
    ) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    return payload;
  }

  private async revokeSession(sessionId: string, userId: string) {
    const now = new Date();
    await this.db
      .update(authSessions)
      .set({ revokedAt: now, updatedAt: now })
      .where(
        and(
          eq(authSessions.id, sessionId),
          eq(authSessions.userId, userId),
          isNull(authSessions.revokedAt),
        ),
      );
  }

  private hashToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }

  private hashesMatch(storedHash: string, presentedHash: string) {
    const stored = Buffer.from(storedHash, 'hex');
    const presented = Buffer.from(presentedHash, 'hex');
    return (
      stored.length === presented.length && timingSafeEqual(stored, presented)
    );
  }

  private async sanitizeUser(user: User) {
    const roles = await this.db
      .select({
        role: userRoles.role,
      })
      .from(userRoles)
      .where(eq(userRoles.userId, user.id));

    const { password, ...safeUser } = user;
    void password;

    return {
      ...safeUser,
      roles: roles.map(({ role }) => role),
    };
  }
}
