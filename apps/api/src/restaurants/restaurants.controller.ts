import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { RestaurantsService } from './restaurants.service';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/role.decorator';
import { JwtPayload, UserRole } from '@food-delivery/types';
import { Request as ExpressRequest } from 'express';
import { FindRestaurantsDto } from './dto/find-restaurant.dto';
import { RestaurantOnboardingDto } from './dto/restaurant-onboarding.dto';

type AuthRequest = ExpressRequest & { user: JwtPayload };

@Controller('restaurants')
export class RestaurantsController {
  constructor(private restaurantsService: RestaurantsService) {}

  @Post('onboarding')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER, UserRole.RESTAURANT_OWNER)
  onboard(@Request() req: AuthRequest, @Body() dto: RestaurantOnboardingDto) {
    return this.restaurantsService.onboard(req.user.sub, dto);
  }

  @Get('mine')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.RESTAURANT_OWNER)
  findMine(@Request() req: AuthRequest) {
    return this.restaurantsService.findMine(req.user.sub);
  }

  // Public
  @Get()
  findAll(@Query('search') search?: string) {
    return this.restaurantsService.findAll(search);
  }

  // Public
  @Get('params')
  findAllWithParams(@Query() query: FindRestaurantsDto) {
    return this.restaurantsService.findAllWithParams(query);
  }

  // Public
  @Get(':id')
  findMe(@Param('id') id: string) {
    return this.restaurantsService.findById(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.RESTAURANT_OWNER)
  update(
    @Param('id') id: string,
    @Request() req: AuthRequest,
    @Body() dto: UpdateRestaurantDto,
  ) {
    return this.restaurantsService.update(id, req.user.sub, dto);
  }
}
