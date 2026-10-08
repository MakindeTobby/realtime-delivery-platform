import { JwtPayload } from '@food-delivery/types';
import { Controller, Post, Request, UseGuards } from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DriverService } from './driver.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

type AuthRequest = ExpressRequest & {
  user: JwtPayload;
};

@Controller('driver')
@UseGuards(JwtAuthGuard)
@ApiTags('Driver')
@ApiBearerAuth('access-token')
export class DriverOnboardingController {
  constructor(private readonly driverService: DriverService) {}

  @Post('apply')
  @ApiOperation({ summary: 'Apply to become a driver' })
  apply(@Request() req: AuthRequest) {
    return this.driverService.applyForDriver(req.user.sub);
  }
}
