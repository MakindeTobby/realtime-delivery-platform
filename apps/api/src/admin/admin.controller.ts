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
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiTags('Admin')
@ApiBearerAuth('access-token')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}
@Get('drivers/pending')
@ApiOperation({ summary: 'List driver applications awaiting review' })
getPendingDrivers() {
  return this.adminService.getPendingDrivers();
}

@Get('restaurants/pending')
@ApiOperation({ summary: 'List restaurant applications awaiting review' })
getPendingRestaurants() {
  return this.adminService.getPendingRestaurants();
}
  @Patch('drivers/:id/verification')
  @ApiBody({ type: UpdateVerificationStatusDto })
  @ApiOperation({ summary: 'Approve or reject a driver application' })
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
  @ApiBody({ type: UpdateVerificationStatusDto })
  @ApiOperation({ summary: 'Approve or reject a restaurant application' })
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
