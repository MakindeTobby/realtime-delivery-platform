import { UserRole } from '@food-delivery/types';
import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/role.decorator';
import { AdminService } from './admin.service';
import { UpdateVerificationStatusDto } from './dto/update-verification-status.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}
@Get('drivers/pending')
getPendingDrivers() {
  return this.adminService.getPendingDrivers();
}

@Get('restaurants/pending')
getPendingRestaurants() {
  return this.adminService.getPendingRestaurants();
}
  @Patch('drivers/:id/verification')
  updateDriverVerification(
    @Param('id') id: string,
    @Body() dto: UpdateVerificationStatusDto,
  ) {
    return this.adminService.updateDriverVerification(
      id,
      dto.status,
    );
  }

  @Patch('restaurants/:id/verification')
  updateRestaurantVerification(
    @Param('id') id: string,
    @Body() dto: UpdateVerificationStatusDto,
  ) {
    return this.adminService.updateRestaurantVerification(
      id,
      dto.status,
    );
  }
}