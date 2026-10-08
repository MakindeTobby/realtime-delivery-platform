import { useMutation, useQueryClient } from "@tanstack/react-query";
import { restaurantsApi } from "@/api/restaurants.api";
import { authQueryKeys } from "@/hooks/auth/useAuth";
import { restaurantQueryKeys } from "@/hooks/restaurants/useRestaurantDashboard";

export function useRestaurantOnboardingMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: restaurantsApi.onboard,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: restaurantQueryKeys.mine }),
        queryClient.invalidateQueries({ queryKey: authQueryKeys.currentUser }),
      ]);
    },
  });
}
