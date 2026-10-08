import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtPayload, UserRole } from '@food-delivery/types';
import { Request as ExpressRequest } from 'express';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { Roles } from '../auth/decorators/role.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UpdateStatusDto } from './dto/update-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';

type AuthRequest = ExpressRequest & { user: JwtPayload };

@Controller('orders')
@UseGuards(JwtAuthGuard)
@ApiTags('Orders')
@ApiBearerAuth('access-token')
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Post()
  @ApiBody({ type: CreateOrderDto })
  @ApiOperation({ summary: 'Create an order from available restaurant menu items' })
  @UseGuards(RolesGuard)
  @Roles(UserRole.CUSTOMER)
  create(@Request() req: AuthRequest, @Body() dto: CreateOrderDto) {
    return this.ordersService.create(req.user.sub, dto);
  }

  @Get('mine')
  @ApiOperation({ summary: 'List the authenticated customer or driver orders' })
  @UseGuards(RolesGuard)
  @Roles(UserRole.CUSTOMER, UserRole.DRIVER)
  findMine(@Request() req: AuthRequest) {
    return this.ordersService.findMyOrders(req.user.sub, req.user.roles);
  }

  @Get('restaurant')
  @ApiOperation({ summary: 'List orders for the authenticated owner’s restaurants' })
  @UseGuards(RolesGuard)
  @Roles(UserRole.RESTAURANT_OWNER)
  findByRestaurant(@Request() req: AuthRequest) {
    return this.ordersService.findByRestaurant(req.user.sub);
  }

  @Patch(':id/status')
  @ApiBody({ type: UpdateStatusDto })
  @ApiOperation({ summary: 'Advance an order through an allowed status transition' })
  @UseGuards(RolesGuard)
  @Roles(UserRole.RESTAURANT_OWNER, UserRole.DRIVER)
  updateStatus(
    @Param('id') id: string,
    @Request() req: AuthRequest,
    @Body() dto: UpdateStatusDto,
  ) {
    return this.ordersService.updateStatus(id, dto.status, req.user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an order visible to the authenticated user' })
  @UseGuards(RolesGuard)
  findOne(@Param('id') id: string, @Request() req: AuthRequest) {
    return this.ordersService.findById(id, req.user);
  }
}
