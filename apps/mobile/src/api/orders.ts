import { api } from "@/lib/axios";
import type { OrderStatusValue } from "@/types/order";

export type ApiOrderItem = {
  id: string;
  orderId: string;
  menuItemId: string | null;
  itemName: string;
  unitPrice: string;
  quantity: number;
  createdAt: string;
};

export type ApiOrder = {
  id: string;
  customerId: string;
  restaurantId: string;
  driverId: string | null;
  status: OrderStatusValue;
  paymentStatus: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  totalAmount: string;
  deliveryAddress: string;
  deliveryCity: string;
  deliveryLatitude?: string | null;
  deliveryLongitude?: string | null;
  createdAt: string;
  updatedAt: string;
  driver?: {
    id: string;
    firstName: string;
    lastName: string;
    phone: string | null;
    location: {
      latitude: string;
      longitude: string;
      heading: string | null;
      speed: string | null;
      recordedAt: string;
    } | null;
  } | null;
  restaurant?: { id: string; name: string };
  items: ApiOrderItem[];
};

type CreateOrderBase = {
  restaurantId: string;
  items: { menuItemId: string; quantity: number }[];
};

export type CreateOrderPayload = CreateOrderBase & (
  | { addressId: string; deliveryAddress?: string; deliveryCity?: string }
  | { addressId?: never; deliveryAddress: string; deliveryCity: string }
);

export const ordersApi = {
  async create(payload: CreateOrderPayload) {
    const { data } = await api.post<ApiOrder>("/orders", payload);
    return data;
  },
  async getMine() {
    const { data } = await api.get<ApiOrder[]>("/orders/mine");
    return data;
  },
  async getRestaurantOrders() {
    const { data } = await api.get<ApiOrder[]>("/orders/restaurant");
    return data;
  },
  async getById(id: string) {
    const { data } = await api.get<ApiOrder>(`/orders/${id}`);
    return data;
  },
  async updateStatus(id: string, status: OrderStatusValue) {
    const { data } = await api.patch<ApiOrder>(`/orders/${id}/status`, { status });
    return data;
  },
};
