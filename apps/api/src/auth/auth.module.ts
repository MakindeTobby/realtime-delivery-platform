import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ACCESS_TOKEN_TTL_SECONDS } from "./session.constants";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { AuthRateLimitService } from "./auth-rate-limit.service";
import { AuthRateLimitGuard } from "./guards/auth-rate-limit.guard";

@Module({
    imports: [JwtModule.registerAsync({
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
            secret: configService.getOrThrow<string>('JWT_SECRET'),
            signOptions: { expiresIn: ACCESS_TOKEN_TTL_SECONDS }

        })
    })],
    controllers: [AuthController],
    providers: [AuthService, AuthRateLimitService, AuthRateLimitGuard],
    exports: [JwtModule]
})

export class AuthModule { }
