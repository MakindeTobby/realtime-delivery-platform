


import { JwtPayload, UserRole } from "@food-delivery/types";
import { Body, Controller, Get, Param, Patch, Post, Request, UseGuards } from "@nestjs/common";
import { Request as ExpressRequest } from 'express'
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/role.decorator";
import { DriverService } from "./driver.service";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UpdateDriverLocationDto } from './dto/update-driver-location.dto';
type AuthRequest = ExpressRequest & { user: JwtPayload }

@Controller('driver')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.DRIVER)
@ApiTags('Driver')
@ApiBearerAuth('access-token')

export class DriverController {
    constructor(private driverService: DriverService) { }

    @Patch('online')
    @ApiOperation({ summary: 'Toggle the approved driver’s online availability' })
    toggleOnline(@Request() req: AuthRequest) {
        return this.driverService.toggleOnline(req.user.sub);
    }

    @Get('status')
    @ApiOperation({ summary: 'Get driver availability status' })
    getStatus(@Request() req: AuthRequest) {
        return this.driverService.getStatus(req.user.sub)
    }

    @Post('location')
    @ApiBody({ type: UpdateDriverLocationDto })
    @ApiOperation({ summary: 'Share the authenticated driver’s current location during an active delivery' })
    updateLocation(@Request() req: AuthRequest, @Body() dto: UpdateDriverLocationDto) {
        return this.driverService.updateLocation(req.user.sub, dto)
    }

    @Post('orders/:id/decline')
    @ApiOperation({ summary: 'Decline an assigned order' })
    declineOrder(@Param('id') id: string, @Request() req: AuthRequest) {
        return this.driverService.declineOrder(id, req.user.sub)
    }

}
