import { useEffect, useState } from "react";
import {
    OrderStatus,
    type Driver,
    type OrderSocketMessage,
    type OrderStatusValue,
} from "@/types/order";
import { useOrdersStore } from "@/store/orders";

const TERMINAL_STATUSES: OrderStatusValue[] = [OrderStatus.DELIVERED, OrderStatus.CANCELLED];

type TrackingState = {
    status: OrderStatusValue;
    driver: Driver | null;
    etaMinutes: number | null;
    isConnecting: boolean;
    connectionError: string | null;
};

// No real orders backend exists yet — flip this off once one does. The real
// branch below connects to `${ORDERS_WS_URL}/${orderId}` and expects
// OrderSocketMessage JSON frames (see types/order.ts). Swap ORDERS_WS_URL
// for your actual endpoint.
const USE_MOCK_SOCKET = true;
const ORDERS_WS_URL = process.env.EXPO_PUBLIC_ORDERS_WS_URL ?? "wss://YOUR_API_HOST/orders";

const MOCK_DRIVER: Driver = {
    id: "driver-1",
    name: "Budi Santoso",
    vehicleType: "Motorcycle",
    plateNumber: "B 4821 TKP",
    rating: 4.9,
    phone: "+6281234567890",
    avatarColor: "#F0506B",
};

export function useOrderTracking(orderId: string) {
    const existingOrder = useOrdersStore((s) => s.getOrder(orderId));
    const updateStoredStatus = useOrdersStore((s) => s.updateStatus);
    const isAlreadyResolved = !!existingOrder && TERMINAL_STATUSES.includes(existingOrder.status);

    const [state, setState] = useState<TrackingState>({
        status: existingOrder?.status ?? OrderStatus.PENDING,
        driver: null,
        etaMinutes: null,
        isConnecting: !isAlreadyResolved,
        connectionError: null,
    });

    useEffect(() => {
        // Reopening a delivered/cancelled order from past orders — show it as
        // already resolved immediately, don't replay (mock) or reconnect (real)
        // a finished order's progression.
        if (isAlreadyResolved) {
            setState((s) => ({ ...s, isConnecting: false }));
            return;
        }

        const onStatusChange = (status: OrderStatusValue) => updateStoredStatus(orderId, status);

        if (USE_MOCK_SOCKET) {
            return runMockSocket(setState, onStatusChange);
        }
        return runRealSocket(orderId, setState, onStatusChange);
        // isAlreadyResolved is derived from the store snapshot at mount time —
        // re-running this effect if it changes would tear down and restart an
        // in-progress connection the instant the first status update lands.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [orderId]);

    return state;
}

function applyMessage(
    message: OrderSocketMessage,
    setState: React.Dispatch<React.SetStateAction<TrackingState>>,
    onStatusChange: (status: OrderStatusValue) => void
) {
    if (message.type === "ORDER_STATUS_UPDATE") {
        setState((s) => ({ ...s, status: message.status }));
        onStatusChange(message.status);
    } else if (message.type === "DRIVER_ASSIGNED") {
        setState((s) => ({ ...s, driver: message.driver }));
    } else if (message.type === "ETA_UPDATE") {
        setState((s) => ({ ...s, etaMinutes: message.etaMinutes }));
    }
}

function runRealSocket(
    orderId: string,
    setState: React.Dispatch<React.SetStateAction<TrackingState>>,
    onStatusChange: (status: OrderStatusValue) => void
) {
    const socket = new WebSocket(`${ORDERS_WS_URL}/${orderId}`);

    socket.onopen = () => setState((s) => ({ ...s, isConnecting: false }));

    socket.onerror = () =>
        setState((s) => ({ ...s, isConnecting: false, connectionError: "Connection lost" }));

    socket.onmessage = (event) => {
        try {
            const message = JSON.parse(event.data) as OrderSocketMessage;
            applyMessage(message, setState, onStatusChange);
        } catch {
            // Malformed frame — drop it rather than crash the tracking screen.
        }
    };

    // Production needs more than this: reconnect-with-backoff on drop, and
    // reconnect on AppState going active again after backgrounding. Neither
    // is built here — flagging it rather than pretending this is robust.
    return () => socket.close();
}

function runMockSocket(
    setState: React.Dispatch<React.SetStateAction<TrackingState>>,
    onStatusChange: (status: OrderStatusValue) => void
) {
    const timeline: { delay: number; status: OrderStatusValue; driver?: Driver }[] = [
        { delay: 1200, status: OrderStatus.PENDING },
        { delay: 2600, status: OrderStatus.CONFIRMED },
        { delay: 5500, status: OrderStatus.PREPARING },
        { delay: 9500, status: OrderStatus.READY },
        { delay: 12000, status: OrderStatus.PICKED_UP, driver: MOCK_DRIVER },
        { delay: 18000, status: OrderStatus.DELIVERED },
    ];

    const timers = timeline.map((step) =>
        setTimeout(() => {
            setState((s) => ({
                ...s,
                isConnecting: false,
                status: step.status,
                driver: step.driver ?? s.driver,
            }));
            onStatusChange(step.status);
        }, step.delay)
    );

    return () => timers.forEach(clearTimeout);
}