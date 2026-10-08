import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { and, desc, eq, ne } from 'drizzle-orm';
import type { Database } from '../db';
import { userAddresses } from '../db/schema';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@Injectable()
export class AddressesService {
  constructor(@Inject('DB') private readonly db: Database) {}

  listMine(userId: string) {
    return this.db
      .select()
      .from(userAddresses)
      .where(eq(userAddresses.userId, userId))
      .orderBy(desc(userAddresses.isDefault), desc(userAddresses.updatedAt));
  }

  async create(userId: string, dto: CreateAddressDto) {
    if ((dto.latitude === undefined) !== (dto.longitude === undefined)) {
      throw new BadRequestException(
        'Latitude and longitude must be provided together',
      );
    }

    return this.db.transaction(async (tx) => {
      const existing = await tx
        .select({ id: userAddresses.id })
        .from(userAddresses)
        .where(eq(userAddresses.userId, userId));
      const isDefault = dto.isDefault ?? existing.length === 0;

      if (isDefault) {
        await tx
          .update(userAddresses)
          .set({ isDefault: false, updatedAt: new Date() })
          .where(eq(userAddresses.userId, userId));
      }

      const [address] = await tx
        .insert(userAddresses)
        .values({
          userId,
          label: dto.label.trim(),
          address: dto.address.trim(),
          city: dto.city.trim(),
          latitude: dto.latitude === undefined ? null : dto.latitude.toFixed(7),
          longitude: dto.longitude === undefined ? null : dto.longitude.toFixed(7),
          isDefault,
        })
        .returning();

      return address;
    });
  }

  async update(userId: string, id: string, dto: UpdateAddressDto) {
    const hasLatitude = dto.latitude !== undefined;
    const hasLongitude = dto.longitude !== undefined;
    if (hasLatitude !== hasLongitude) {
      throw new BadRequestException(
        'Latitude and longitude must be updated together',
      );
    }

    return this.db.transaction(async (tx) => {
      if (dto.isDefault === true) {
        await tx
          .update(userAddresses)
          .set({ isDefault: false, updatedAt: new Date() })
          .where(and(eq(userAddresses.userId, userId), ne(userAddresses.id, id)));
      }

      const [address] = await tx
        .update(userAddresses)
        .set({
          ...(dto.label !== undefined && { label: dto.label.trim() }),
          ...(dto.address !== undefined && { address: dto.address.trim() }),
          ...(dto.city !== undefined && { city: dto.city.trim() }),
          ...(dto.latitude !== undefined && { latitude: dto.latitude.toFixed(7) }),
          ...(dto.longitude !== undefined && { longitude: dto.longitude.toFixed(7) }),
          ...(dto.isDefault !== undefined && { isDefault: dto.isDefault }),
          updatedAt: new Date(),
        })
        .where(and(eq(userAddresses.id, id), eq(userAddresses.userId, userId)))
        .returning();

      if (!address) {
        throw new NotFoundException('Address not found');
      }

      return address;
    });
  }

  async remove(userId: string, id: string) {
    return this.db.transaction(async (tx) => {
      const [deleted] = await tx
        .delete(userAddresses)
        .where(and(eq(userAddresses.id, id), eq(userAddresses.userId, userId)))
        .returning({ id: userAddresses.id, wasDefault: userAddresses.isDefault });

      if (!deleted) {
        throw new NotFoundException('Address not found');
      }

      if (deleted.wasDefault) {
        const [replacement] = await tx
          .select({ id: userAddresses.id })
          .from(userAddresses)
          .where(eq(userAddresses.userId, userId))
          .orderBy(desc(userAddresses.updatedAt))
          .limit(1);

        if (replacement) {
          await tx
            .update(userAddresses)
            .set({ isDefault: true, updatedAt: new Date() })
            .where(eq(userAddresses.id, replacement.id));
        }
      }

      return { id: deleted.id };
    });
  }
}
