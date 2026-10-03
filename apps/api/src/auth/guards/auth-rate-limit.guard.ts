import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request, Response } from 'express';
import {
  AUTH_RATE_LIMIT_KEY,
  AuthRateLimitPolicy,
} from '../decorators/auth-rate-limit.decorator';
import { AuthRateLimitService } from '../auth-rate-limit.service';

@Injectable()
export class AuthRateLimitGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly rateLimitService: AuthRateLimitService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const policy = this.reflector.get<AuthRateLimitPolicy>(
      AUTH_RATE_LIMIT_KEY,
      context.getHandler(),
    );
    if (!policy) return true;

    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const clientIp = request.ip || request.socket.remoteAddress || 'unknown';

    if (policy === 'login') {
      await this.checkLimit(
        response,
        'login:ip',
        clientIp,
        this.rateLimitService.getLimit('AUTH_LOGIN_IP_MAX', 20),
        this.rateLimitService.getLimit('AUTH_LOGIN_IP_WINDOW_SECONDS', 900),
      );

      const email = request.body?.email;
      if (typeof email === 'string' && email.trim()) {
        await this.checkLimit(
          response,
          'login:email',
          email.trim().toLowerCase(),
          this.rateLimitService.getLimit('AUTH_LOGIN_EMAIL_MAX', 10),
          this.rateLimitService.getLimit(
            'AUTH_LOGIN_EMAIL_WINDOW_SECONDS',
            900,
          ),
        );
      }
    } else if (policy === 'register') {
      await this.checkLimit(
        response,
        'register:ip',
        clientIp,
        this.rateLimitService.getLimit('AUTH_REGISTER_IP_MAX', 5),
        this.rateLimitService.getLimit(
          'AUTH_REGISTER_IP_WINDOW_SECONDS',
          3600,
        ),
      );
    } else if (policy === 'forgot-password') {
      await this.checkLimit(
        response,
        'forgot-password:ip',
        clientIp,
        this.rateLimitService.getLimit('AUTH_FORGOT_PASSWORD_IP_MAX', 10),
        this.rateLimitService.getLimit(
          'AUTH_FORGOT_PASSWORD_IP_WINDOW_SECONDS',
          3600,
        ),
      );

      const email = request.body?.email;
      if (typeof email === 'string' && email.trim()) {
        await this.checkLimit(
          response,
          'forgot-password:email',
          email.trim().toLowerCase(),
          this.rateLimitService.getLimit('AUTH_FORGOT_PASSWORD_EMAIL_MAX', 3),
          this.rateLimitService.getLimit(
            'AUTH_FORGOT_PASSWORD_EMAIL_WINDOW_SECONDS',
            3600,
          ),
        );
      }
    } else {
      await this.checkLimit(
        response,
        'reset-password:ip',
        clientIp,
        this.rateLimitService.getLimit('AUTH_RESET_PASSWORD_IP_MAX', 10),
        this.rateLimitService.getLimit(
          'AUTH_RESET_PASSWORD_IP_WINDOW_SECONDS',
          3600,
        ),
      );
    }

    return true;
  }

  private async checkLimit(
    response: Response,
    scope: string,
    identity: string,
    maxAttempts: number,
    windowSeconds: number,
  ) {
    const result = await this.rateLimitService.consume(
      scope,
      identity,
      maxAttempts,
      windowSeconds,
    );

    if (!result.allowed) {
      response.setHeader('Retry-After', String(result.retryAfterSeconds));
      throw new HttpException(
        'Too many authentication attempts',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }
}
