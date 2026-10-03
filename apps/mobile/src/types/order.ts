export const OrderStatus = {
    PENDING: "PENDING",
    CONFIRMED: "CONFIRMED",
    PREPARING: "PREPARING",
    READY: "READY",
    PICKED_UP: "PICKED_UP",
    DELIVERED: "DELIVERED",
    CANCELLED: "CANCELLED",
} as const;

export type OrderStatusValue = (typeof OrderStatus)[keyof typeof OrderStatus];

export const ORDER_STATUS_LABELS: Record<OrderStatusValue, string> = {
    PENDING: "Pending",
    CONFIRMED: "Confirmed",
    PREPARING: "Preparing",
    READY: "Ready",
    PICKED_UP: "On the way",
    DELIVERED: "Delivered",
    CANCELLED: "Cancelled",
};

export type Driver = {
    id: string;
    name: string;
    vehicleType: string;
    plateNumber: string;
    rating: number;
    phone: string;
    avatarColor: string; // placeholder until real driver photos exist
};

// Messages this client expects from the orders WebSocket. Adjust this shape
// to match your actual backend contract once one exists — everything in
// hooks/useOrderTracking.ts is written against this.
export type OrderSocketMessage =
    | { type: "ORDER_STATUS_UPDATE"; orderId: string; status: OrderStatusValue }
    | { type: "DRIVER_ASSIGNED"; orderId: string; driver: Driver }
    | { type: "ETA_UPDATE"; orderId: string; etaMinutes: number };