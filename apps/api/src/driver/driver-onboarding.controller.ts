import { JwtPayload } from '@food-delivery/types';
import { Controller, Post, Request, UseGuards } from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DriverService } from './driver.service';

type AuthRequest = ExpressRequest & {
  user: JwtPayload;
};

@Controller('driver')
@UseGuards(JwtAuthGuard)
export class DriverOnboardingController {
  constructor(private readonly driverService: DriverService) {}

  @Post('apply')
  apply(@Request() req: AuthRequest) {
    return this.driverService.applyForDriver(req.user.sub);
  }
}