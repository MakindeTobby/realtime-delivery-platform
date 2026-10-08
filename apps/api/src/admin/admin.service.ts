import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Database } from '../db';
import {
  driverProfiles,
  restaurants,
  users,
  verificationStatusEnum,
} from '../db/schema';
import { eq } from 'drizzle-orm';

type VerificationStatus = (typeof verificationStatusEnum.enumValues)[number];
@Injectable()
export class AdminService {
  constructor(
    @Inject('DB')
    private readonly db: Database,
  ) {}

  async updateDriverVerification(driverId: string, status: VerificationStatus) {
    if (status === 'PENDING') {
      throw new BadRequestException(
        'Admin cannot set driver verification back to PENDING',
      );
    }

    const [driver] = await this.db
      .update(driverProfiles)
      .set({
        verificationStatus: status,
        isOnline: status === 'APPROVED' ? undefined : false,
        updatedAt: new Date(),
      })
      .where(eq(driverProfiles.id, driverId))
      .returning();

    if (!driver) {
      throw new NotFoundException('Driver profile not found');
    }

    return driver;
  }

  async updateRestaurantVerification(
    restaurantId: string,
    status: VerificationStatus,
  ) {
    if (status === 'PENDING') {
      throw new BadRequestException(
        'Admin cannot set restaurant verification back to PENDING',
      );
    }

    const [restaurant] = await this.db
      .update(restaurants)
      .set({
        verificationStatus: status,
        isOpen: status === 'APPROVED' ? undefined : false,
        updatedAt: new Date(),
      })
      .where(eq(restaurants.id, restaurantId))
      .returning();

    if (!restaurant) {
      throw new NotFoundException('Restaurant not found');
    }

    return restaurant;
  }
  async getPendingDrivers() {
    return this.db
      .select({
        id: driverProfiles.id,
        userId: driverProfiles.userId,
        verificationStatus: driverProfiles.verificationStatus,
        isOnline: driverProfiles.isOnline,
        createdAt: driverProfiles.createdAt,
        updatedAt: driverProfiles.updatedAt,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        phone: users.phone,
      })
      .from(driverProfiles)
      .innerJoin(users, eq(driverProfiles.userId, users.id))
      .where(eq(driverProfiles.verificationStatus, 'PENDING'));
  }

  async getPendingRestaurants() {
    return this.db
      .select({
        id: restaurants.id,
        ownerId: restaurants.ownerId,
        name: restaurants.name,
        description: restaurants.description,
        imageUrl: restaurants.imageUrl,
        address: restaurants.address,
        city: restaurants.city,
        cuisineType: restaurants.cuisineType,
        verificationStatus: restaurants.verificationStatus,
        isOpen: restaurants.isOpen,
        createdAt: restaurants.createdAt,
        updatedAt: restaurants.updatedAt,
        ownerFirstName: users.firstName,
        ownerLastName: users.lastName,
        ownerEmail: users.email,
        ownerPhone: users.phone,
      })
      .from(restaurants)
      .innerJoin(users, eq(restaurants.ownerId, users.id))
      .where(eq(restaurants.verificationStatus, 'PENDING'));
  }
}
