import { api } from "@/lib/axios";

export type PublicRestaurant = {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  address: string;
  city: string;
  cuisineType: string;
  verificationStatus: "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";
  isOpen: boolean;
  createdAt: string;
  updatedAt: string;
};

export type PublicMenuItem = {
  id: string;
  restaurantId: string;
  categoryId: string;
  name: string;
  description: string | null;
  price: string;
  imageUrl: string | null;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
};

export type PublicMenuCategory = {
  id: string;
  restaurantId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

export type HomeMenuItem = PublicMenuItem & {
  restaurantName: string;
  restaurantCity: string;
  restaurantCuisineType: string;
};

export type RestaurantSearchFilters = {
  search?: string;
  cuisineType?: string;
  isOpen?: boolean;
  page?: number;
  limit?: number;
};

export const customerApi = {
  async getRestaurants(filters: RestaurantSearchFilters = {}) {
    const { data } = await api.get<{
      data: PublicRestaurant[];
      meta: { page: number; limit: number; totalItems: number; totalPages: number };
    }>("/restaurants/params", {
      params: { page: 1, limit: 20, isOpen: true, ...filters },
    });
    return data.data;
  },

  async getRestaurantMenu(restaurantId: string) {
    const { data } = await api.get<PublicMenuItem[]>(
      `/restaurants/${restaurantId}/menu/items`,
    );
    return data;
  },

  async getRestaurant(restaurantId: string) {
    const { data } = await api.get<PublicRestaurant>(`/restaurants/${restaurantId}`);
    return data;
  },

  async getRestaurantCategories(restaurantId: string) {
    const { data } = await api.get<PublicMenuCategory[]>(
      `/restaurants/${restaurantId}/menu/categories`,
    );
    return data;
  },

  async getRestaurantDetails(restaurantId: string) {
    const [restaurant, categories, menuItems] = await Promise.all([
      customerApi.getRestaurant(restaurantId),
      customerApi.getRestaurantCategories(restaurantId),
      customerApi.getRestaurantMenu(restaurantId),
    ]);
    return { restaurant, categories, menuItems };
  },

  async getHomeFeed() {
    const restaurants = await customerApi.getRestaurants();
    // The API currently exposes menu items per restaurant rather than a
    // global customer feed, so compose a small home feed from the first few
    // public restaurants and keep the rest available in Discover.
    const restaurantMenus = await Promise.all(
      restaurants.slice(0, 8).map(async (restaurant) => {
        try {
          const items = await customerApi.getRestaurantMenu(restaurant.id);
          return items
            .filter((item) => item.isAvailable)
            .map((item) => ({
              ...item,
              restaurantName: restaurant.name,
              restaurantCity: restaurant.city,
              restaurantCuisineType: restaurant.cuisineType,
            }));
        } catch {
          // One restaurant's menu failure should not hide the rest of the home feed.
          return [];
        }
      }),
    );

    return {
      restaurants,
      menuItems: restaurantMenus.flat().slice(0, 24),
    };
  },

  async getExploreFeed(search: string, cuisineType?: string) {
    const feed = await customerApi.getHomeFeed();
    if (!search.trim() && !cuisineType) return feed;

    const filteredRestaurants = await customerApi.getRestaurants({
      search: search.trim() || undefined,
      cuisineType,
      isOpen: true,
      page: 1,
      limit: 20,
    });
    const restaurantsById = new Map(
      [...feed.restaurants, ...filteredRestaurants].map((restaurant) => [restaurant.id, restaurant]),
    );

    return {
      restaurants: [...restaurantsById.values()],
      menuItems: feed.menuItems.filter((item) => {
        const matchesCuisine = !cuisineType ||
          item.restaurantCuisineType.toLowerCase().includes(cuisineType.toLowerCase());
        const term = search.trim().toLowerCase();
        const matchesSearch = !term ||
          `${item.name} ${item.description ?? ""} ${item.restaurantName} ${item.restaurantCity}`
            .toLowerCase()
            .includes(term);
        return matchesCuisine && matchesSearch;
      }),
    };
  },
};
