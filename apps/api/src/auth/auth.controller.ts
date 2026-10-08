import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { Request as ExpressRequest } from 'express';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtPayload } from '@food-delivery/types';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { AuthRateLimit } from './decorators/auth-rate-limit.decorator';
import { AuthRateLimitGuard } from './guards/auth-rate-limit.guard';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { EmailVerificationService } from './email-verification.service';
import { ResendVerificationDto } from './dto/resend-verification.dto';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CheckPartnerExistenceDto } from './dto/check-partner.dto';

@Controller('auth') // /api/auth
@ApiTags('Authentication')
export class AuthController {
  constructor(
    private authService: AuthService,
    private emailVerificationService: EmailVerificationService,
  ) {}

  @Post('register') //  /api/auth/register
  @ApiOperation({ summary: 'Register a customer account' })
  @ApiBody({ type: RegisterDto })
  @UseGuards(AuthRateLimitGuard)
  @AuthRateLimit('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Sign in with email and password' })
  @ApiBody({ type: LoginDto })
  @UseGuards(AuthRateLimitGuard)
  @AuthRateLimit('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Rotate an access and refresh token pair' })
  @ApiBody({ type: RefreshTokenDto })
  refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refresh(dto);
  }

  @Post('logout')
  @ApiOperation({ summary: 'Revoke the current refresh-token session' })
  @ApiBody({ type: RefreshTokenDto })
  logout(@Body() dto: RefreshTokenDto) {
    return this.authService.logout(dto);
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Request a password reset' })
  @ApiBody({ type: ForgotPasswordDto })
  @UseGuards(AuthRateLimitGuard)
  @AuthRateLimit('forgot-password')
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Set a new password using a reset token' })
  @ApiBody({ type: ResetPasswordDto })
  @UseGuards(AuthRateLimitGuard)
  @AuthRateLimit('reset-password')
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @Get('me')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get the authenticated user profile and roles' })
  @UseGuards(JwtAuthGuard)
  me(@Request() req: ExpressRequest & { user: JwtPayload }) {
    return this.authService.getCurrentUser(req.user.sub);
  }

  @Post('verify-email')
  @ApiOperation({ summary: 'Verify an email address with its six-digit code' })
  @ApiBody({ type: VerifyEmailDto })
  verifyEmail(@Body() dto: VerifyEmailDto) {
    return this.emailVerificationService.verifyEmail(dto.email, dto.code);
  }
  @Post('resend-verification')
  @ApiOperation({ summary: 'Request another email verification code' })
  @ApiBody({ type: ResendVerificationDto })
  resendVerification(@Body() dto: ResendVerificationDto) {
    return this.emailVerificationService.resendVerificationCode(dto.email);
  }
  @Post('partner/check-existence')
  @ApiOperation({ summary: 'Check if a partner account exists' })
  @ApiBody({ type: CheckPartnerExistenceDto })
  checkPartnerExistence(@Body() dto: CheckPartnerExistenceDto) {
    return this.authService.checkPartnerExistence(dto.email);
  }
}
