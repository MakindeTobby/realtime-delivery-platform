import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ordersApi, type CreateOrderPayload } from "@/api/orders";
import type { OrderStatusValue } from "@/types/order";

export const orderQueryKeys = {
  mine: ["orders", "mine"] as const,
  restaurant: ["orders", "restaurant"] as const,
  detail: (id: string) => ["orders", "detail", id] as const,
};

export function useMyOrdersQuery() {
  return useQuery({
    queryKey: orderQueryKeys.mine,
    queryFn: ordersApi.getMine,
    staleTime: 10_000,
    refetchInterval: 15_000,
  });
}

export function useRestaurantOrdersQuery() {
  return useQuery({
    queryKey: orderQueryKeys.restaurant,
    queryFn: ordersApi.getRestaurantOrders,
    staleTime: 5_000,
    refetchInterval: 10_000,
  });
}

export function useOrderQuery(id: string) {
  return useQuery({
    queryKey: orderQueryKeys.detail(id),
    queryFn: () => ordersApi.getById(id),
    enabled: Boolean(id),
    staleTime: 5_000,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === "DELIVERED" || status === "CANCELLED" ? false : 10_000;
    },
  });
}

export function useCreateOrderMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateOrderPayload) => ordersApi.create(payload),
    onSuccess: (order) => {
      queryClient.setQueryData(orderQueryKeys.detail(order.id), order);
      void queryClient.invalidateQueries({ queryKey: orderQueryKeys.mine });
    },
  });
}

export function useUpdateOrderStatusMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatusValue }) =>
      ordersApi.updateStatus(id, status),
    onSuccess: (order) => {
      queryClient.setQueryData(orderQueryKeys.detail(order.id), order);
      void queryClient.invalidateQueries({ queryKey: orderQueryKeys.mine });
      void queryClient.invalidateQueries({ queryKey: orderQueryKeys.restaurant });
    },
  });
}
