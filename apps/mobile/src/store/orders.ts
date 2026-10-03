import { create } from "zustand";
import { OrderStatus, type OrderStatusValue } from "@/types/order";

export type OrderRecord = {
    id: string;
    restaurantId: string;
    restaurantName: string;
    itemsSummary: string; // e.g. "Bottega's Fried Rice +2 more"
    itemCount: number;
    totalPayment: number;
    status: OrderStatusValue;
    createdAt: number; // Date.now()
};

type OrdersState = {
    orders: OrderRecord[];
    addOrder: (order: OrderRecord) => void;
    updateStatus: (id: string, status: OrderStatusValue) => void;
    getOrder: (id: string) => OrderRecord | undefined;
};

export const useOrdersStore = create<OrdersState>((set, get) => ({
    orders: [],

    addOrder: (order) => set((state) => ({ orders: [order, ...state.orders] })),

    updateStatus: (id, status) =>
        set((state) => ({
            orders: state.orders.map((o) => (o.id === id ? { ...o, status } : o)),
        })),

    getOrder: (id) => get().orders.find((o) => o.id === id),
}));

export const ACTIVE_STATUSES: OrderStatusValue[] = [
    OrderStatus.PENDING,
    OrderStatus.CONFIRMED,
    OrderStatus.PREPARING,
    OrderStatus.READY,
    OrderStatus.PICKED_UP,
];

export const PAST_STATUSES: OrderStatusValue[] = [OrderStatus.DELIVERED, OrderStatus.CANCELLED];