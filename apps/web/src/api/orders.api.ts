import { api } from "@/lib/axios";

export type RestaurantOrder = {
  id: string;
  restaurantId: string;
  status: "PENDING" | "CONFIRMED" | "PREPARING" | "READY" | "PICKED_UP" | "DELIVERED" | "CANCELLED";
  paymentStatus: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  totalAmount: string;
  deliveryAddress: string;
  deliveryCity: string;
  createdAt: string;
  items: Array<{
    id: string;
    itemName: string;
    quantity: number;
    unitPrice: string;
  }>;
};

export const ordersApi = {
  async getRestaurantOrders() {
    const { data } = await api.get<RestaurantOrder[]>("/orders/restaurant");
    return data;
  },
  async updateStatus(id: string, status: "PREPARING" | "READY") {
    const { data } = await api.patch<RestaurantOrder>(`/orders/${id}/status`, { status });
    return data;
  },
};
