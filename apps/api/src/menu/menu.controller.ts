import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/role.decorator';
import { JwtPayload, UserRole } from '@food-delivery/types';
import { Request as ExpressRequest } from 'express';
import { MenuService } from './menu.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';

type AuthRequest = ExpressRequest & { user: JwtPayload };

@Controller('restaurants/:restaurantId/menu')
@ApiTags('Restaurant menu')
export class MenuController {
  constructor(private menuService: MenuService) {}

  // CATEGORIES

  @Post('categories')
  @ApiBearerAuth('access-token')
  @ApiBody({ type: CreateCategoryDto })
  @ApiOperation({ summary: 'Create a menu category' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.RESTAURANT_OWNER)
  createCategory(
    @Param('restaurantId') restaurantId: string,
    @Request() req: AuthRequest,
    @Body() dto: CreateCategoryDto,
  ) {
    return this.menuService.createCategory(req.user.sub, restaurantId, dto);
  }

  @Get('categories')
  @ApiOperation({ summary: 'List restaurant menu categories' })
  getCategories(@Param('restaurantId') restaurantId: string) {
    return this.menuService.getCategories(restaurantId);
  }

  @Patch('categories/:id')
  @ApiBearerAuth('access-token')
  @ApiBody({ type: UpdateCategoryDto })
  @ApiOperation({ summary: 'Update a menu category' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.RESTAURANT_OWNER)
  updateCategory(
    @Param('restaurantId') restaurantId: string,
    @Param('id') id: string,
    @Request() req: AuthRequest,
    @Body() dto: UpdateCategoryDto,
  ) {
    return this.menuService.updateCategory(id, restaurantId, req.user.sub, dto);
  }

  @Delete('categories/:id')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Delete a menu category' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.RESTAURANT_OWNER)
  deleteCategory(
    @Param('restaurantId') restaurantId: string,
    @Param('id') id: string,
    @Request() req: AuthRequest,
  ) {
    return this.menuService.deleteCategory(id, restaurantId, req.user.sub);
  }

  // MENU ITEMS

  @Post('items')
  @ApiBearerAuth('access-token')
  @ApiBody({ type: CreateMenuItemDto })
  @ApiOperation({ summary: 'Create a menu item' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.RESTAURANT_OWNER)
  createItem(
    @Param('restaurantId') restaurantId: string,
    @Request() req: AuthRequest,
    @Body() dto: CreateMenuItemDto,
  ) {
    return this.menuService.createItem(req.user.sub, restaurantId, dto);
  }

  @Get('items')
  @ApiOperation({ summary: 'List menu items for a restaurant' })
  getItems(@Param('restaurantId') restaurantId: string) {
    return this.menuService.getItemsByRestaurant(restaurantId);
  }

  @Patch('items/:id')
  @ApiBearerAuth('access-token')
  @ApiBody({ type: UpdateMenuItemDto })
  @ApiOperation({ summary: 'Update a menu item' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.RESTAURANT_OWNER)
  updateItem(
    @Param('restaurantId') restaurantId: string,
    @Param('id') id: string,
    @Request() req: AuthRequest,
    @Body() dto: UpdateMenuItemDto,
  ) {
    return this.menuService.updateItem(id, restaurantId, req.user.sub, dto);
  }

  @Delete('items/:id')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Delete a menu item' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.RESTAURANT_OWNER)
  deleteItem(
    @Param('restaurantId') restaurantId: string,
    @Param('id') id: string,
    @Request() req: AuthRequest,
  ) {
    return this.menuService.deleteItem(id, restaurantId, req.user.sub);
  }
}
