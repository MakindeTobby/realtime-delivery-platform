import { ForbiddenException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import type { Database } from "../db";
import { restaurants } from "../db/schema";
import { and, asc, count, eq, ilike, or } from "drizzle-orm";
import { CreateRestaurantDto } from "./dto/create-restaurant.dto";
import { UpdateRestaurantDto } from "./dto/update-restaurant.dto";
import { FindRestaurantsDto } from "./dto/find-restaurant.dto";

@Injectable()
export class RestaurantsService {
    constructor(
        @Inject('DB')
        private readonly db: Database,
    ) { }

    async create(ownerId: string, dto: CreateRestaurantDto) {
        const [existing] = await this.db.select().from(restaurants).where(eq(restaurants.ownerId, ownerId));
        if (existing) throw new ForbiddenException('You already have a restaurant')

        const [restaurant] = await this.db.insert(restaurants).values({
            ownerId,
            name: dto.name,
            description: dto.description,
            address: dto.address,
            cuisineType: dto.cuisineType,
            imageUrl: dto.imageUrl
        }).returning()

        return restaurant;
    }


    async findMine(ownerId: string) {
        const [restaurant] = await this.db.select().from(restaurants).where(eq(restaurants.ownerId, ownerId));

        return restaurant ?? null
    }
    async findById(id: string) {
        const [restaurant] = await this.db.select().from(restaurants).where(eq(restaurants.id, id));
        if (!restaurant) throw new NotFoundException('Restaurant not found')
        return restaurant;
    }
    async findAll(search?: string) {
        // if search is provided, filter by name, OR cuisine type (case-insesitive)
        // only return open restaurants to customers
        const query = search?.trim();
        if (query) {
            return this.db.select().from(restaurants).where(
                and(
                    eq(restaurants.isOpen, true),
                    or(
                        ilike(restaurants.name, `%${query}%`),
                        ilike(restaurants.cuisineType, `%${query}%`)
                    )
                )
            )
        }


        return this.db.select().from(restaurants).where(eq(restaurants.isOpen, true))
    }

    async update(id: string, ownerId: string, dto: UpdateRestaurantDto) {
        const [restaurant] = await this.db.select().from(restaurants).where(eq(restaurants.id, id));
        if (!restaurant) throw new NotFoundException('Restaurant not found');
        if (restaurant.ownerId !== ownerId) throw new ForbiddenException('You do not own this restaurant')

        const [updated] = await this.db.update(restaurants).set({
            ...dto,
            updatedAt: new Date()
        }).where(and(
            eq(restaurants.id, id),
            eq(restaurants.ownerId, ownerId)
        ))

            .returning()

        return updated;
    }

    async findAllWithParams(dto: FindRestaurantsDto) {
        const {
            search,
            cuisineType,
            isOpen = true,
            page = 1,
            limit = 20,
        } = dto;

        const offset = (page - 1) * limit;

        const conditions = [
            eq(restaurants.isOpen, isOpen),
        ];

        // Search restaurant name or cuisine type
        if (search?.trim()) {
            const query = `%${search.trim()}%`;

            conditions.push(
                or(
                    ilike(restaurants.name, query),
                    ilike(restaurants.cuisineType, query),
                )!,
            );
        }

        // Filter by cuisine
        if (cuisineType?.trim()) {
            conditions.push(
                ilike(
                    restaurants.cuisineType,
                    `%${cuisineType.trim()}%`,
                ),
            );
        }

        // Fetch restaurants
        const data = await this.db
            .select()
            .from(restaurants)
            .where(and(...conditions))
            .orderBy(asc(restaurants.name))
            .limit(limit)
            .offset(offset);

        // Get total matching restaurants
        const [{ total }] = await this.db
            .select({
                total: count(),
            })
            .from(restaurants)
            .where(and(...conditions));

        const totalItems = Number(total);
        const totalPages = Math.ceil(totalItems / limit);

        return {
            data,
            meta: {
                page,
                limit,
                totalItems,
                totalPages,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1,
            },
        };
    }
}



