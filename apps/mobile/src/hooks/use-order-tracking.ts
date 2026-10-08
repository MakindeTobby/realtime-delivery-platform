import { useOrderQuery } from "@/hooks/use-orders";
import { OrderStatus } from "@/types/order";

export function useOrderTracking(orderId: string) {
  const query = useOrderQuery(orderId);
  return {
    order: query.data ?? null,
    status: query.data?.status ?? OrderStatus.PENDING,
    driver: null,
    etaMinutes: null,
    isConnecting: query.isLoading,
    connectionError: query.isError
      ? "We couldn’t load this order. Check your connection and retry."
      : null,
    refetch: query.refetch,
  };
}
