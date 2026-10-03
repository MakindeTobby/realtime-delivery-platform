import { colors } from "@/theme";

export type ChatThread = {
    id: string;
    name: string;
    role: "Restaurant" | "Driver" | "Support";
    avatarColor: string;
    lastMessage: string;
    timestamp: number;
    unreadCount: number;
};

// Standing in for real conversations until messaging has a backend — these
// mirror the restaurant/driver already used on the order tracking screen,
// so the app feels consistent rather than introducing new unrelated names.
export const MOCK_CHAT_THREADS: ChatThread[] = [
    {
        id: "thread-bottega",
        name: "Bottega Ristorante",
        role: "Restaurant",
        avatarColor: colors.dish.topPicks,
        lastMessage: "Your order is being prepared now!",
        timestamp: Date.now() - 1000 * 60 * 12,
        unreadCount: 1,
    },
    {
        id: "thread-driver",
        name: "Budi Santoso",
        role: "Driver",
        avatarColor: "#F0506B",
        lastMessage: "I'm on my way, about 10 minutes out.",
        timestamp: Date.now() - 1000 * 60 * 2,
        unreadCount: 0,
    },
];