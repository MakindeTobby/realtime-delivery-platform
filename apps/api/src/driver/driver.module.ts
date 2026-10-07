import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { GatewayModule } from '../gateway/gateway.module';
import { DriverController } from './driver.controller';
import { DriverOnboardingController } from './driver-onboarding.controller';
import { DriverService } from './driver.service';

@Module({
  imports: [AuthModule, GatewayModule],
  controllers: [DriverController, DriverOnboardingController],
  providers: [DriverService],
  exports: [DriverService],
})
export class DriverModule {}
