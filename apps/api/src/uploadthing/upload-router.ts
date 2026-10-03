import { JwtPayload, UserRole } from '@food-delivery/types';
import { UnauthorizedException } from '@nestjs/common';
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

export function createUploadRouter(jwtService: JwtService, db: Database): FileRouter {
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

    if (user.role !== UserRole.RESTAURANT_OWNER) {
      throw new UploadThingError('Only restaurant owners can upload these images');
    }
    return { uploadedBy: user.sub };
  };

  return {
    restaurantImage: f({
      image: { maxFileSize: '4MB', maxFileCount: 1 },
    })
      .middleware(({ req }) => requireRestaurantOwner(req.headers.authorization))
      .onUploadComplete(({ file, metadata }) => {
        console.log('Upload completed by:', metadata.uploadedBy);
        console.log('File URL:', file.ufsUrl);
        return { url: file.ufsUrl };
      }),
    menuItemImage: f({
      image: { maxFileSize: '4MB', maxFileCount: 1 },
    })
      .middleware(({ req }) => requireRestaurantOwner(req.headers.authorization))
      .onUploadComplete(({ file }) => ({ url: file.ufsUrl })),
  } satisfies FileRouter;
}

export type OurFileRouter = FileRouter;
