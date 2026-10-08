export const UserRole = {
  CUSTOMER: "CUSTOMER",
  RESTAURANT_OWNER: "RESTAURANT_OWNER",
  DRIVER: "DRIVER",
  ADMIN: "ADMIN",
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  emailVerified: boolean;
  roles: UserRole[];
  createdAt: Date | string;
}
export interface UserResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresIn: number;
}
export interface HealthCheckResponse {
  status: string;
  timestamp: string;
}

export interface JwtPayload {
  sub: string;
  email: string;
  roles: UserRole[];
}
export interface AuthenticatedUser {
  sub: string;
  email: string;
  roles: UserRole[];
}

export interface RestaurantType {
  id: string;
  ownerId: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  address: string;
  cuisineType: string;
  isOpen: boolean;
  rating: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MenuCategory {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  restaurantId: string;
}

export interface MenuItem {
  name: string;
  id: string;
  createdAt: Date;
  updatedAt: Date;
  description: string | null;
  imageUrl: string | null;
  restaurantId: string;
  categoryId: string;
  price: string;
  isAvailable: boolean;
}

export interface RestaurantWithMenu {
  restaurant: RestaurantType;
  categories: MenuCategory;
  items: MenuItem;
}

export const OrderStatus = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  PREPARING: "PREPARING",
  READY: "READY",
  PICKED_UP: "PICKED_UP",
  DELIVERED: "DELIVERED",
  CANCELLED: "CANCELLED",
} as const;

export type OrderStatusType = (typeof OrderStatus)[keyof typeof OrderStatus];

export interface CartItem {
  id: string;
  name: string;
  price: string;
  imageUrl: string | null;
  restaurantId: string;
  quantity: number;
}
