import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Database } from '../db';
import { menuCategories, menuItems, restaurants } from '../db/schema';
import { and, eq } from 'drizzle-orm';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';

@Injectable()
export class MenuService {
  constructor(
    @Inject('DB')
    private readonly db: Database,
  ) {}

  /**
   * Verifies that the authenticated user owns the restaurant
   * they are trying to operate on.
   */
  private async getOwnedRestaurant(ownerId: string, restaurantId: string) {
    const [restaurant] = await this.db
      .select()
      .from(restaurants)
      .where(
        and(eq(restaurants.id, restaurantId), eq(restaurants.ownerId, ownerId)),
      );

    if (!restaurant) {
      throw new ForbiddenException('You do not own this restaurant');
    }

    return restaurant;
  }

  // CATEGORIES

  async createCategory(
    ownerId: string,
    restaurantId: string,
    dto: CreateCategoryDto,
  ) {
    await this.getOwnedRestaurant(ownerId, restaurantId);

    const [category] = await this.db
      .insert(menuCategories)
      .values({
        restaurantId,
        name: dto.name,
      })
      .returning();

    return category;
  }

  async getCategories(restaurantId: string) {
    return this.db
      .select()
      .from(menuCategories)
      .where(eq(menuCategories.restaurantId, restaurantId));
  }

  async updateCategory(
    id: string,
    restaurantId: string,
    ownerId: string,
    dto: UpdateCategoryDto,
  ) {
    await this.getOwnedRestaurant(ownerId, restaurantId);

    const [category] = await this.db
      .select()
      .from(menuCategories)
      .where(
        and(
          eq(menuCategories.id, id),
          eq(menuCategories.restaurantId, restaurantId),
        ),
      );

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const [updated] = await this.db
      .update(menuCategories)
      .set({
        name: dto.name,
      })
      .where(eq(menuCategories.id, id))
      .returning();

    return updated;
  }

  async deleteCategory(id: string, restaurantId: string, ownerId: string) {
    await this.getOwnedRestaurant(ownerId, restaurantId);

    const [category] = await this.db
      .select()
      .from(menuCategories)
      .where(
        and(
          eq(menuCategories.id, id),
          eq(menuCategories.restaurantId, restaurantId),
        ),
      );

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    await this.db.delete(menuCategories).where(eq(menuCategories.id, id));

    return { message: 'Category deleted' };
  }

  // MENU ITEMS

  async createItem(
    ownerId: string,
    restaurantId: string,
    dto: CreateMenuItemDto,
  ) {
    await this.getOwnedRestaurant(ownerId, restaurantId);

    const [category] = await this.db
      .select()
      .from(menuCategories)
      .where(
        and(
          eq(menuCategories.id, dto.categoryId),
          eq(menuCategories.restaurantId, restaurantId),
        ),
      );

    if (!category) {
      throw new NotFoundException('Category not found in this restaurant');
    }

    const [item] = await this.db
      .insert(menuItems)
      .values({
        restaurantId,
        categoryId: dto.categoryId,
        name: dto.name,
        description: dto.description,
        price: dto.price,
        imageUrl: dto.imageUrl,
      })
      .returning();

    return item;
  }

  async getItemsByRestaurant(restaurantId: string) {
    return this.db
      .select()
      .from(menuItems)
      .where(eq(menuItems.restaurantId, restaurantId));
  }

  async updateItem(
    id: string,
    restaurantId: string,
    ownerId: string,
    dto: UpdateMenuItemDto,
  ) {
    await this.getOwnedRestaurant(ownerId, restaurantId);

    const [item] = await this.db
      .select()
      .from(menuItems)
      .where(
        and(eq(menuItems.id, id), eq(menuItems.restaurantId, restaurantId)),
      );

    if (!item) {
      throw new NotFoundException('Menu item not found');
    }

    if (dto.categoryId !== undefined) {
      const [category] = await this.db
        .select()
        .from(menuCategories)
        .where(
          and(
            eq(menuCategories.id, dto.categoryId),
            eq(menuCategories.restaurantId, restaurantId),
          ),
        );

      if (!category) {
        throw new NotFoundException('Category not found in this restaurant');
      }
    }

    const [updated] = await this.db
      .update(menuItems)
      .set({
        ...dto,
        updatedAt: new Date(),
      })
      .where(
        and(eq(menuItems.id, id), eq(menuItems.restaurantId, restaurantId)),
      )
      .returning();

    return updated;
  }

  async deleteItem(id: string, restaurantId: string, ownerId: string) {
    await this.getOwnedRestaurant(ownerId, restaurantId);

    const [item] = await this.db
      .select()
      .from(menuItems)
      .where(
        and(eq(menuItems.id, id), eq(menuItems.restaurantId, restaurantId)),
      );

    if (!item) {
      throw new NotFoundException('Menu item not found');
    }

    await this.db.delete(menuItems).where(eq(menuItems.id, id));

    return { message: 'Item deleted' };
  }
}
