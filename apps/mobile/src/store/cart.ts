import { create } from "zustand";

export type CartItem = {
    id: string;
    name: string;
    price: number;
    originalPrice?: number; // pre-discount unit price, for cart savings totals
    quantity: number;
    restaurantId: string;
    note?: string;
};

type CartState = {
    items: CartItem[];
    restaurantId: string | null;
    deliveryAddress: string;
    deliveryCity: string;
    deliveryAddressId: string | null;
    deliveryLatitude: number | null;
    deliveryLongitude: number | null;
    deliveryNote: string;
    addItem: (item: Omit<CartItem, "quantity">) => void;
    increment: (id: string) => void;
    decrement: (id: string) => void;
    removeItem: (id: string) => void;
    setNote: (id: string, note: string) => void;
    setDeliveryAddress: (address: string) => void;
    setDeliveryCity: (city: string) => void;
    setDeliveryAddressId: (id: string | null) => void;
    setDeliveryCoordinates: (latitude: number | null, longitude: number | null) => void;
    setDeliveryNote: (note: string) => void;
    clearCart: () => void;
    getQuantity: (id: string) => number;
    totalItems: () => number;
    totalPrice: () => number;
    totalOriginalPrice: () => number;
};

export const useCartStore = create<CartState>((set, get) => ({
    items: [],
    restaurantId: null,
    deliveryAddress: "",
    deliveryCity: "",
    deliveryAddressId: null,
    deliveryLatitude: null,
    deliveryLongitude: null,
    deliveryNote: "",

    addItem: (item) => {
        const { items, restaurantId } = get();

        // Adding from a second restaurant while items from a different one are
        // still in the cart — most food-delivery apps block or confirm-clear
        // this instead of silently merging two restaurants' orders. This
        // replaces the cart outright; swap for a confirmation dialog if you'd
        // rather ask the user first.
        if (restaurantId && restaurantId !== item.restaurantId && items.length > 0) {
            set({ items: [{ ...item, quantity: 1 }], restaurantId: item.restaurantId });
            return;
        }

        const existing = items.find((i) => i.id === item.id);
        if (existing) {
            set({
                items: items.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i)),
            });
        } else {
            set({
                items: [...items, { ...item, quantity: 1 }],
                restaurantId: item.restaurantId,
            });
        }
    },

    increment: (id) =>
        set((state) => ({
            items: state.items.map((i) => (i.id === id ? { ...i, quantity: i.quantity + 1 } : i)),
        })),

    decrement: (id) =>
        set((state) => {
            const target = state.items.find((i) => i.id === id);
            if (!target) return state;
            if (target.quantity <= 1) {
                const items = state.items.filter((i) => i.id !== id);
                return { items, restaurantId: items.length ? state.restaurantId : null };
            }
            return {
                items: state.items.map((i) => (i.id === id ? { ...i, quantity: i.quantity - 1 } : i)),
            };
        }),

    removeItem: (id) =>
        set((state) => {
            const items = state.items.filter((i) => i.id !== id);
            return { items, restaurantId: items.length ? state.restaurantId : null };
        }),

    setNote: (id, note) =>
        set((state) => ({
            items: state.items.map((i) => (i.id === id ? { ...i, note } : i)),
        })),

    setDeliveryAddress: (deliveryAddress) =>
        set({ deliveryAddress, deliveryAddressId: null, deliveryLatitude: null, deliveryLongitude: null }),

    setDeliveryCity: (deliveryCity) =>
        set({ deliveryCity, deliveryAddressId: null, deliveryLatitude: null, deliveryLongitude: null }),

    setDeliveryAddressId: (deliveryAddressId) => set({ deliveryAddressId }),

    setDeliveryCoordinates: (deliveryLatitude, deliveryLongitude) =>
        set({ deliveryLatitude, deliveryLongitude }),

    setDeliveryNote: (deliveryNote) => set({ deliveryNote }),

    clearCart: () => set({ items: [], restaurantId: null }),

    getQuantity: (id) => get().items.find((i) => i.id === id)?.quantity ?? 0,

    totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

    totalPrice: () => get().items.reduce((sum, i) => sum + i.quantity * i.price, 0),

    // Falls back to the discounted price per-item when no originalPrice was
    // recorded, so an item with no discount doesn't look like it saved money.
    totalOriginalPrice: () =>
        get().items.reduce((sum, i) => sum + i.quantity * (i.originalPrice ?? i.price), 0),
}));
