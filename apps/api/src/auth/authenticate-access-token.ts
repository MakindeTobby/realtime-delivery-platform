import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { and, eq, gt, isNull } from 'drizzle-orm';
import { JwtPayload } from '@food-delivery/types';
import type { Database } from '../db';
import { authSessions, users } from '../db/schema';

type AccessTokenPayload = JwtPayload & {
  sessionId: string;
  tokenType: 'access';
};

/** Verifies an access token against both JWT claims and the current session/user state. */
export async function authenticateAccessToken(
  token: string,
  jwtService: JwtService,
  db: Database,
): Promise<JwtPayload> {
  let payload: AccessTokenPayload;
  try {
    payload = jwtService.verify<AccessTokenPayload>(token);
  } catch {
    throw new UnauthorizedException('Invalid or expired token');
  }

  if (
    payload.tokenType !== 'access' ||
    typeof payload.sessionId !== 'string' ||
    typeof payload.sub !== 'string'
  ) {
    throw new UnauthorizedException('Invalid or expired token');
  }

  const [activeSession] = await db
    .select({
      userId: users.id,
      email: users.email,
      role: users.role,
    })
    .from(authSessions)
    .innerJoin(users, eq(authSessions.userId, users.id))
    .where(
      and(
        eq(authSessions.id, payload.sessionId),
        eq(authSessions.userId, payload.sub),
        isNull(authSessions.revokedAt),
        gt(authSessions.expiresAt, new Date()),
      ),
    );

  if (!activeSession) {
    throw new UnauthorizedException('Invalid or expired token');
  }

  return {
    sub: activeSession.userId,
    email: activeSession.email,
    role: activeSession.role,
  };
}
