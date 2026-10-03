import { ForbiddenException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import type { Database } from "../db";
import { menuCategories, menuItems, restaurants } from "../db/schema";
import { eq } from "drizzle-orm";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";
import { CreateMenuItemDto } from "./dto/create-menu-item.dto";
import { UpdateMenuItemDto } from "./dto/update-menu-item.dto";


@Injectable()
export class MenuService {
    constructor(
        @Inject('DB')
        private readonly db: Database,
    ) { }

    private async getRestaurantByOwnerId(ownerId: string) {
        const [restaurant] = await this.db
            .select()
            .from(restaurants)
            .where(eq(restaurants.ownerId, ownerId));

        if (!restaurant) {
            throw new NotFoundException('Create a restaurant first');
        }

        return restaurant;
    }


    // CATEGORIES

    async createCategory(ownerId: string, dto: CreateCategoryDto) {
        const restaurant = await this.getRestaurantByOwnerId(ownerId)

        const [category] = await this.db.insert(menuCategories).values({
            restaurantId: restaurant.id, name: dto.name
        }).returning()

        return category
    }

    async getCategories(restaurantId: string) {
        return this.db.select().from(menuCategories).where(eq(menuCategories.restaurantId, restaurantId))
    }

    async updateCategory(id: string, ownerId: string, dto: UpdateCategoryDto) {
        const restaurant = await this.getRestaurantByOwnerId(ownerId)
        const [category] = await this.db.select().from(menuCategories).where(eq(menuCategories.id, id))
        if (!category) throw new NotFoundException("Category not found")

        if (category.restaurantId !== restaurant.id)
            throw new ForbiddenException("This category does not belong to your restaurant");

        const [updated] = await this.db.update(menuCategories).set({ name: dto.name }).where(eq(menuCategories.id, id)).returning();

        return updated

    }

    async deleteCategory(id: string, ownerId: string) {
        const restaurant = await this.getRestaurantByOwnerId(ownerId)
        const [category] = await this.db.select().from(menuCategories).where(eq(menuCategories.id, id))
        if (!category) throw new NotFoundException("Category not found")

        if (category.restaurantId !== restaurant.id)
            throw new ForbiddenException("This category does not belong to your restaurant");

        //Cascade  delete will remove all items in this category automatically

        await this.db.delete(menuCategories).where(eq(menuCategories.id, id))
        return { message: 'Category deleted' };

    }

    //MENU ITEMS


    async createItem(ownerId: string, dto: CreateMenuItemDto) {
        const restaurant = await this.getRestaurantByOwnerId(ownerId)
        const [category] = await this.db
            .select()
            .from(menuCategories)
            .where(eq(menuCategories.id, dto.categoryId))

        if (!category) {
            throw new NotFoundException('Category not found')
        }

        if (category.restaurantId !== restaurant.id) {
            throw new ForbiddenException(
                'This category does not belong to your restaurant'
            )
        }

        const [item] = await this.db.insert(menuItems).values({
            restaurantId: restaurant.id,
            categoryId: dto.categoryId,
            name: dto.name,
            description: dto.description,
            price: dto.price,
            imageUrl: dto.imageUrl
        }).returning()

        return item
    }


    async getItemsByRestaurant(restaurantId: string) {
        //returns all items for a retsurant - frontend groups them by category
        return this.db.select().from(menuItems).where(eq(menuItems.restaurantId, restaurantId));
    }

    async updateItem(id: string, ownerId: string, dto: UpdateMenuItemDto

    ) {
        const restaurant = await this.getRestaurantByOwnerId(ownerId)
        const [item] = await this.db.select().from(menuItems).where(eq(menuItems.id, id))
        if (!item) throw new NotFoundException("Menu item not found")

        if (item.restaurantId !== restaurant.id)
            throw new ForbiddenException("This item does not belong to your restaurant");
        if (dto.categoryId !== undefined) {
            const [category] = await this.db
                .select()
                .from(menuCategories)
                .where(eq(menuCategories.id, dto.categoryId))

            if (!category) {
                throw new NotFoundException('Category not found')
            }

            if (category.restaurantId !== restaurant.id) {
                throw new ForbiddenException(
                    'This category does not belong to your restaurant'
                )
            }
        }

        const [updated] = await this.db.update(menuItems).set({ ...dto, updatedAt: new Date() }).where(eq(menuItems.id, id)).returning();

        return updated

    }

    async deleteItem(id: string, ownerId: string) {
        const restaurant = await this.getRestaurantByOwnerId(ownerId)
        const [item] = await this.db.select().from(menuItems).where(eq(menuItems.id, id))
        if (!item) throw new NotFoundException("Menu item not found")

        if (item.restaurantId !== restaurant.id)
            throw new ForbiddenException("This item does not belong to your restaurant");

        //Cascade  delete will remove all items in this category automatically

        await this.db.delete(menuItems).where(eq(menuItems.id, id))
        return { message: 'Item deleted' };

    }


}



// const [updated] = await this.db
//     .update(menuItems)
//     .set({
//         ...dto,
//         updatedAt: new Date(),
//     })
//     .where(
//         and(
//             eq(menuItems.id, id),
//             eq(menuItems.restaurantId, restaurant.id),
//         )
//     )
//     .returning();