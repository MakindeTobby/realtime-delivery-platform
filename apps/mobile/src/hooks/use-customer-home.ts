import { useQuery } from "@tanstack/react-query";
import { customerApi } from "@/api/customer";

export const customerQueryKeys = {
  restaurants: (search?: string, cuisineType?: string) =>
    ["customer", "restaurants", search ?? "", cuisineType ?? ""] as const,
  home: ["customer", "home"] as const,
};

export function useCustomerHomeQuery() {
  return useQuery({
    queryKey: customerQueryKeys.home,
    queryFn: customerApi.getHomeFeed,
    staleTime: 60_000,
  });
}

export function useCustomerRestaurantsQuery(search?: string, cuisineType?: string) {
  return useQuery({
    queryKey: customerQueryKeys.restaurants(search, cuisineType),
    queryFn: () => customerApi.getRestaurants({
      search: search || undefined,
      cuisineType: cuisineType || undefined,
    }),
    staleTime: 60_000,
  });
}

export function useCustomerRestaurantQuery(restaurantId: string) {
  return useQuery({
    queryKey: ["customer", "restaurant", restaurantId] as const,
    queryFn: () => customerApi.getRestaurantDetails(restaurantId),
    enabled: Boolean(restaurantId),
    staleTime: 60_000,
  });
}
