import { useEffect, useState } from "react";
import { io, Socket } from 'socket.io-client'

let socket: Socket | null = null;
function getSocket(): Socket {
    if (!socket) {
        socket = io(`${process.env.EXPO_PUBLIC_SERVER_URL}/orders`, {
            transports: ['websocket'], // force real websocket - skip HTTP long-polling
            autoConnect: false, //we connect normally when the screen needs it
        })
    }

    return socket
}

export function useOrderSocket(orderId: string | null) {
    const [orderUpdate, setOrderUpdate] = useState<Record<
        string,
        unknown
    > | null>(null);

    useEffect(() => {
        if (!orderId) return;

        const s = getSocket();
        s.connect()// open the Websocket connection
        s.emit('join:order', orderId) // tell server to put us in order:<orderId> room

        //runs when server emits 'order:updated' - only accepts updtaes for THIS order
        const handler = (data: { id?: string }) => {
            if (data.id === orderId) setOrderUpdate(data)
        };

        s.on('order:updated', handler);

        //clean on unmount - remove listener + disconnect to prevent memory leaks

        return () => {
            s.off('order:updated', handler);
            s.disconnect();
        }
    }, [orderId])

}

export function useRestaurantSocket(restaurantId: string | null) {
    const [orderUpdate, setOrderUpdate] = useState<Record<
        string,
        unknown
    > | null>(null);

    useEffect(() => {
        if (!restaurantId) return;

        const s = getSocket();
        s.connect()// open the Websocket connection
        s.emit('join:restaurant', restaurantId)

        //any order update for this restaurant triggers a refetch
        const handler = (data: Record<string, unknown>) => {
            setOrderUpdate(data)
        };

        s.on('order:updated', handler);

        //clean on unmount - remove listener + disconnect to prevent memory leaks

        return () => {
            s.off('order:updated', handler);
            s.disconnect();
        }
    }, [restaurantId])

    return orderUpdate; // screen calls invalidateQueries when this changes
}