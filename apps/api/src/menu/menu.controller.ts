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

type AuthRequest = ExpressRequest & { user: JwtPayload };

@Controller('restaurants/:restaurantId/menu')
export class MenuController {
  constructor(private menuService: MenuService) {}

  // CATEGORIES

  @Post('categories')
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
  getCategories(@Param('restaurantId') restaurantId: string) {
    return this.menuService.getCategories(restaurantId);
  }

  @Patch('categories/:id')
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
  getItems(@Param('restaurantId') restaurantId: string) {
    return this.menuService.getItemsByRestaurant(restaurantId);
  }

  @Patch('items/:id')
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
