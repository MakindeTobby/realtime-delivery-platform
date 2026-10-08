import { UserRole } from '@food-delivery/types';
import type { JwtPayload } from '@food-delivery/types';
import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { createUploadthing, type FileRouter } from 'uploadthing/express';
import { UploadThingError } from 'uploadthing/server';
import { JwtService } from '@nestjs/jwt';
import type { Database } from '../db';
import { authenticateAccessToken } from '../auth/authenticate-access-token';

const f = createUploadthing();

function getBearerToken(authorization: string | undefined): string {
  const [scheme, token, extra] = authorization?.split(' ') ?? [];
  if (scheme !== 'Bearer' || !token || extra) {
    throw new UploadThingError('Authentication required');
  }
  return token;
}

export function createUploadRouter(
  jwtService: JwtService,
  db: Database,
): FileRouter {
  const requireRestaurantOwner = async (authorization: string | undefined) => {
    const token = getBearerToken(authorization);
    let user: JwtPayload;
    try {
      user = await authenticateAccessToken(token, jwtService, db);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw new UploadThingError('Authentication required');
      }
      throw error;
    }

    if (!user.roles.includes(UserRole.RESTAURANT_OWNER)) {
      throw new ForbiddenException(
        'Only restaurant owners can upload restaurant assets',
      );
    }
    return { uploadedBy: user.sub };
  };

  return {
    restaurantImage: f({
      image: { maxFileSize: '4MB', maxFileCount: 1 },
    })
      .middleware(({ req }) =>
        requireRestaurantOwner(
          (req as unknown as { headers: { authorization?: string } }).headers
            .authorization,
        ),
      )
      .onUploadComplete(({ file, metadata }) => {
        const fileUrl = (file as unknown as { ufsUrl: string }).ufsUrl;
        console.log('Upload completed by:', metadata.uploadedBy);
        console.log('File URL:', fileUrl);
        return { url: fileUrl };
      }),
    menuItemImage: f({
      image: { maxFileSize: '4MB', maxFileCount: 1 },
    })
      .middleware(({ req }) =>
      requireRestaurantOwner(
        (req as unknown as { headers: { authorization?: string } }).headers
          .authorization,
      ),
      )
    .onUploadComplete(({ file }) => ({
      url: (file as unknown as { ufsUrl: string }).ufsUrl,
    })),
  } satisfies FileRouter;
}

export type OurFileRouter = FileRouter;
