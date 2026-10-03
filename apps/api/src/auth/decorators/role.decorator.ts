import { SetMetadata } from "@nestjs/common";
import { UserRole } from "@food-delivery/types";

export const ROLES_KEY = 'roles'

// usage: @Roles(RETAURANT_OWNER) above any route method

export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);

