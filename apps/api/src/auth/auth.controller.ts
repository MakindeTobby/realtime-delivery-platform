import { Body, Controller, Get, Post, Request, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { RegisterDto } from "./dto/register.dto";
import { Request as ExpressRequest } from "express";
import { LoginDto } from "./dto/login.dto";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { JwtPayload } from "@food-delivery/types";
import { RefreshTokenDto } from "./dto/refresh-token.dto";
import { AuthRateLimit } from "./decorators/auth-rate-limit.decorator";
import { AuthRateLimitGuard } from "./guards/auth-rate-limit.guard";
import { ForgotPasswordDto } from "./dto/forgot-password.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";


@Controller('auth') // /api/auth
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('register') //  /api/auth/register
    @UseGuards(AuthRateLimitGuard)
    @AuthRateLimit('register')
    register(@Body() dto: RegisterDto) {
        return this.authService.register(dto)
    }

    @Post("login")
    @UseGuards(AuthRateLimitGuard)
    @AuthRateLimit('login')
    login(@Body() dto: LoginDto) {
        return this.authService.login(dto);
    }

    @Post('refresh')
    refresh(@Body() dto: RefreshTokenDto) {
        return this.authService.refresh(dto);
    }

    @Post('logout')
    logout(@Body() dto: RefreshTokenDto) {
        return this.authService.logout(dto);
    }

    @Post('forgot-password')
    @UseGuards(AuthRateLimitGuard)
    @AuthRateLimit('forgot-password')
    forgotPassword(@Body() dto: ForgotPasswordDto) {
        return this.authService.forgotPassword(dto);
    }

    @Post('reset-password')
    @UseGuards(AuthRateLimitGuard)
    @AuthRateLimit('reset-password')
    resetPassword(@Body() dto: ResetPasswordDto) {
        return this.authService.resetPassword(dto);
    }

    @Get('me')
    @UseGuards(JwtAuthGuard)
    me(@Request() req: ExpressRequest & { user: JwtPayload }) {
        return this.authService.getCurrentUser(req.user.sub)
    }

}
