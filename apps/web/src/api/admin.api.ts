import { api } from "@/lib/axios";

export type VerificationStatus = "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";
export type ReviewableStatus = Exclude<VerificationStatus, "PENDING">;

export type PendingRestaurant = {
  id: string;
  ownerId: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  address: string;
  city: string;
  cuisineType: string;
  verificationStatus: VerificationStatus;
  isOpen: boolean;
  createdAt: string;
  updatedAt: string;
  ownerFirstName: string;
  ownerLastName: string;
  ownerEmail: string;
  ownerPhone: string | null;
};

export type PendingDriver = {
  id: string;
  userId: string;
  verificationStatus: VerificationStatus;
  isOnline: boolean;
  createdAt: string;
  updatedAt: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
};

export const adminApi = {
  async getPendingRestaurants() {
    const { data } = await api.get<PendingRestaurant[]>("/admin/restaurants/pending");
    return data;
  },

  async getPendingDrivers() {
    const { data } = await api.get<PendingDriver[]>("/admin/drivers/pending");
    return data;
  },

  async updateRestaurantVerification(id: string, status: ReviewableStatus) {
    const { data } = await api.patch<PendingRestaurant>(
      `/admin/restaurants/${id}/verification`,
      { status },
    );
    return data;
  },

  async updateDriverVerification(id: string, status: ReviewableStatus) {
    const { data } = await api.patch<PendingDriver>(
      `/admin/drivers/${id}/verification`,
      { status },
    );
    return data;
  },
};
