import { SetMetadata } from '@nestjs/common';

export type AuthRateLimitPolicy =
  | 'login'
  | 'register'
  | 'forgot-password'
  | 'reset-password';
export const AUTH_RATE_LIMIT_KEY = 'authRateLimitPolicy';

export const AuthRateLimit = (policy: AuthRateLimitPolicy) =>
  SetMetadata(AUTH_RATE_LIMIT_KEY, policy);
