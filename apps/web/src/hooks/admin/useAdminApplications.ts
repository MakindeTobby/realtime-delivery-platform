import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/api/admin.api";

export const adminQueryKeys = {
  pendingRestaurants: ["admin", "restaurants", "pending"] as const,
  pendingDrivers: ["admin", "drivers", "pending"] as const,
};

export function usePendingRestaurantsQuery() {
  return useQuery({
    queryKey: adminQueryKeys.pendingRestaurants,
    queryFn: adminApi.getPendingRestaurants,
    retry: false,
  });
}

export function usePendingDriversQuery() {
  return useQuery({
    queryKey: adminQueryKeys.pendingDrivers,
    queryFn: adminApi.getPendingDrivers,
    retry: false,
  });
}

export function useUpdateRestaurantVerificationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: "APPROVED" | "REJECTED" | "SUSPENDED" }) =>
      adminApi.updateRestaurantVerification(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminQueryKeys.pendingRestaurants }),
  });
}

export function useUpdateDriverVerificationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: "APPROVED" | "REJECTED" | "SUSPENDED" }) =>
      adminApi.updateDriverVerification(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminQueryKeys.pendingDrivers }),
  });
}
