import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { restaurantsApi } from "@/api/restaurants.api";
import { menuApi } from "@/api/menu.api";
import { ordersApi } from "@/api/orders.api";
import { authQueryKeys } from "@/hooks/auth/useAuth";

export const restaurantQueryKeys = {
  mine: ["restaurants", "mine"] as const,
  categories: (restaurantId: string) => ["restaurants", restaurantId, "categories"] as const,
  items: (restaurantId: string) => ["restaurants", restaurantId, "menu-items"] as const,
  orders: ["orders", "restaurant"] as const,
};

export function useMyRestaurantsQuery(enabled: boolean) {
  return useQuery({
    queryKey: restaurantQueryKeys.mine,
    queryFn: restaurantsApi.getMine,
    enabled,
    retry: false,
  });
}

export function useRestaurantProfileMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Parameters<typeof restaurantsApi.update>[1] }) =>
      restaurantsApi.update(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: restaurantQueryKeys.mine }),
  });
}

export function useRestaurantCategoriesQuery(restaurantId: string) {
  return useQuery({
    queryKey: restaurantQueryKeys.categories(restaurantId),
    queryFn: () => menuApi.getCategories(restaurantId),
    enabled: Boolean(restaurantId),
  });
}

export function useRestaurantItemsQuery(restaurantId: string) {
  return useQuery({
    queryKey: restaurantQueryKeys.items(restaurantId),
    queryFn: () => menuApi.getItems(restaurantId),
    enabled: Boolean(restaurantId),
  });
}

function useMenuMutation<TVariables>(
  mutationFn: (variables: TVariables) => Promise<unknown>,
  restaurantId: string,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: restaurantQueryKeys.categories(restaurantId) }),
        queryClient.invalidateQueries({ queryKey: restaurantQueryKeys.items(restaurantId) }),
      ]);
    },
  });
}

export function useCreateCategoryMutation(restaurantId: string) {
  return useMenuMutation(
    ({ name }: { name: string }) => menuApi.createCategory(restaurantId, name),
    restaurantId,
  );
}

export function useDeleteCategoryMutation(restaurantId: string) {
  return useMenuMutation(
    ({ id }: { id: string }) => menuApi.deleteCategory(restaurantId, id),
    restaurantId,
  );
}

export function useCreateMenuItemMutation(restaurantId: string) {
  return useMenuMutation(
    (input: Parameters<typeof menuApi.createItem>[1]) => menuApi.createItem(restaurantId, input),
    restaurantId,
  );
}

export function useUpdateMenuItemMutation(restaurantId: string) {
  return useMenuMutation(
    ({ id, input }: { id: string; input: Parameters<typeof menuApi.updateItem>[2] }) =>
      menuApi.updateItem(restaurantId, id, input),
    restaurantId,
  );
}

export function useDeleteMenuItemMutation(restaurantId: string) {
  return useMenuMutation(
    ({ id }: { id: string }) => menuApi.deleteItem(restaurantId, id),
    restaurantId,
  );
}

export function useRestaurantOrdersQuery(enabled: boolean) {
  return useQuery({
    queryKey: restaurantQueryKeys.orders,
    queryFn: ordersApi.getRestaurantOrders,
    enabled,
  });
}

export function useUpdateOrderStatusMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: "PREPARING" | "READY" }) =>
      ordersApi.updateStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: restaurantQueryKeys.orders }),
  });
}

export function useInvalidateRestaurantAuth() {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: restaurantQueryKeys.mine }),
      queryClient.invalidateQueries({ queryKey: authQueryKeys.currentUser }),
    ]);
}
