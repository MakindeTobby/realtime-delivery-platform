import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '@food-delivery/types';
import type { JwtPayload } from '@food-delivery/types';
import type { Database } from '../db';
import { sql } from 'drizzle-orm';
import { and, eq, gt, isNull } from 'drizzle-orm';

import { authSessions, userRoles, users } from '../db/schema';

type AccessTokenPayload = JwtPayload & {
  sub: string;
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
      roles: sql<UserRole[]>`array_agg(${userRoles.role})`,
    })
    .from(authSessions)
    .innerJoin(users, eq(authSessions.userId, users.id))
    .innerJoin(userRoles, eq(userRoles.userId, users.id))
    .where(
      and(
        eq(authSessions.id, payload.sessionId),
        eq(authSessions.userId, payload.sub),
        isNull(authSessions.revokedAt),
        gt(authSessions.expiresAt, new Date()),
      ),
    )
    .groupBy(users.id, users.email);
  if (!activeSession) {
    throw new UnauthorizedException('Invalid or expired token');
  }

  return {
    sub: activeSession.userId,
    email: activeSession.email,
    roles: activeSession.roles,
  };
}
