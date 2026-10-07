import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Database } from '../db';
import { restaurants, userRoles, users } from '../db/schema';
import { and, asc, count, eq, ilike, or } from 'drizzle-orm';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { FindRestaurantsDto } from './dto/find-restaurant.dto';
import { RestaurantOnboardingDto } from './dto/restaurant-onboarding.dto';
import { UserRole } from '@food-delivery/types';

@Injectable()
export class RestaurantsService {
  constructor(
    @Inject('DB')
    private readonly db: Database,
  ) {}

  async onboard(ownerId: string, dto: RestaurantOnboardingDto) {
    return this.db.transaction(async (tx) => {
      const [owner] = await tx
        .select({ id: users.id, emailVerified: users.emailVerified })
        .from(users)
        .where(eq(users.id, ownerId));

      if (!owner) {
        throw new NotFoundException('User not found');
      }
      if (!owner.emailVerified) {
        throw new ForbiddenException(
          'Please verify your email before creating a restaurant',
        );
      }
      const [restaurant] = await tx
        .insert(restaurants)
        .values({
          ownerId,
          name: dto.restaurantName.trim(),
          description: dto.description.trim(),
          address: dto.address.trim(),
          city: dto.city.trim(),
          cuisineType: dto.cuisineType.trim(),
          imageUrl: dto.imageUrl?.trim(),
          verificationStatus: 'PENDING',
          isOpen: false,
        })
        .returning();

      await tx
        .insert(userRoles)
        .values({
          userId: ownerId,
          role: UserRole.RESTAURANT_OWNER,
        })
        .onConflictDoNothing();

      return restaurant;
    });
  }

  async findMine(ownerId: string) {
    return this.db
      .select()
      .from(restaurants)
      .where(eq(restaurants.ownerId, ownerId));
  }

  async findById(id: string) {
    const [restaurant] = await this.db
      .select()
      .from(restaurants)
      .where(eq(restaurants.id, id));

    if (!restaurant) {
      throw new NotFoundException('Restaurant not found');
    }

    return restaurant;
  }

  async findAll(search?: string) {
    const query = search?.trim();

    if (query) {
      return this.db
        .select()
        .from(restaurants)
        .where(
          and(
            eq(restaurants.isOpen, true),
            eq(restaurants.verificationStatus, 'APPROVED'),
            or(
              ilike(restaurants.name, `%${query}%`),
              ilike(restaurants.cuisineType, `%${query}%`),
            ),
          ),
        );
    }

    return this.db
      .select()
      .from(restaurants)
      .where(
        and(
          eq(restaurants.isOpen, true),
          eq(restaurants.verificationStatus, 'APPROVED'),
        ),
      );
  }

  async update(id: string, ownerId: string, dto: UpdateRestaurantDto) {
    const [restaurant] = await this.db
      .select()
      .from(restaurants)
      .where(eq(restaurants.id, id));

    if (!restaurant) {
      throw new NotFoundException('Restaurant not found');
    }

    if (restaurant.ownerId !== ownerId) {
      throw new ForbiddenException('You do not own this restaurant');
    }

    if (dto.isOpen === true && restaurant.verificationStatus !== 'APPROVED') {
      throw new ForbiddenException(
        'Restaurant must be approved before it can be opened',
      );
    }

    const [updated] = await this.db
      .update(restaurants)
      .set({
        ...dto,
        updatedAt: new Date(),
      })
      .where(and(eq(restaurants.id, id), eq(restaurants.ownerId, ownerId)))
      .returning();

    return updated;
  }

  async findAllWithParams(dto: FindRestaurantsDto) {
    const { search, cuisineType, isOpen = true, page = 1, limit = 20 } = dto;

    const offset = (page - 1) * limit;

    const conditions = [
      eq(restaurants.isOpen, isOpen),
      eq(restaurants.verificationStatus, 'APPROVED'),
    ];

    if (search?.trim()) {
      const query = `%${search.trim()}%`;

      conditions.push(
        or(
          ilike(restaurants.name, query),
          ilike(restaurants.cuisineType, query),
        )!,
      );
    }

    if (cuisineType?.trim()) {
      conditions.push(
        ilike(restaurants.cuisineType, `%${cuisineType.trim()}%`),
      );
    }

    const data = await this.db
      .select()
      .from(restaurants)
      .where(and(...conditions))
      .orderBy(asc(restaurants.name))
      .limit(limit)
      .offset(offset);

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
