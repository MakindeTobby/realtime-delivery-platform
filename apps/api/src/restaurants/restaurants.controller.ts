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
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';

type AuthRequest = ExpressRequest & { user: JwtPayload };

@Controller('restaurants')
@ApiTags('Restaurants')
export class RestaurantsController {
  constructor(private restaurantsService: RestaurantsService) {}

  @Post('onboarding')
  @ApiBearerAuth('access-token')
  @ApiBody({ type: RestaurantOnboardingDto })
  @ApiOperation({ summary: 'Apply to onboard a restaurant' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER, UserRole.RESTAURANT_OWNER)
  onboard(@Request() req: AuthRequest, @Body() dto: RestaurantOnboardingDto) {
    return this.restaurantsService.onboard(req.user.sub, dto);
  }

  @Get('mine')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'List restaurants owned by the authenticated user' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.RESTAURANT_OWNER)
  findMine(@Request() req: AuthRequest) {
    return this.restaurantsService.findMine(req.user.sub);
  }

  // Public
  @Get()
  @ApiOperation({ summary: 'Search public restaurant listings' })
  findAll(@Query('search') search?: string) {
    return this.restaurantsService.findAll(search);
  }

  // Public
  @Get('params')
  @ApiOperation({ summary: 'Filter and paginate public restaurant listings' })
  findAllWithParams(@Query() query: FindRestaurantsDto) {
    return this.restaurantsService.findAllWithParams(query);
  }

  // Public
  @Get(':id')
  @ApiOperation({ summary: 'Get a public restaurant by ID' })
  findMe(@Param('id') id: string) {
    return this.restaurantsService.findById(id);
  }

  @Patch(':id')
  @ApiBearerAuth('access-token')
  @ApiBody({ type: UpdateRestaurantDto })
  @ApiOperation({ summary: 'Update an owned restaurant' })
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
