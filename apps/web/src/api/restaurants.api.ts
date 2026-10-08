import { api } from "@/lib/axios";

export type RestaurantApplication = {
  restaurantName: string;
  cuisineType: string;
  description: string;
  address: string;
  city: string;
  imageUrl?: string;
};

export type RestaurantRecord = {
  id: string;
  ownerId: string;
  name: string;
  description: string | null;
  address: string;
  city: string;
  cuisineType: string;
  imageUrl: string | null;
  verificationStatus: "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";
  isOpen: boolean;
  createdAt: string;
  updatedAt: string;
};

export type UpdateRestaurantInput = Partial<
  Pick<RestaurantRecord, "name" | "description" | "address" | "city" | "cuisineType" | "imageUrl" | "isOpen">
>;

export const restaurantsApi = {
  async getMine() {
    const { data } = await api.get<RestaurantRecord[]>("/restaurants/mine");
    return data;
  },

  async onboard(input: RestaurantApplication) {
    const { data } = await api.post("/restaurants/onboarding", input);
    return data;
  },

  async update(id: string, input: UpdateRestaurantInput) {
    const { data } = await api.patch<RestaurantRecord>(`/restaurants/${id}`, input);
    return data;
  },
};
