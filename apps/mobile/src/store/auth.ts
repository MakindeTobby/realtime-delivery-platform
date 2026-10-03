// stores/auth-store.ts

import { User } from "@food-delivery/types";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

import {
    saveTokens,
    deleteTokens,
    getAccessToken,
} from "@/lib/auth";

type AuthState = {
    user: User | null;
    isAuthenticated: boolean;
    isHydrating: boolean;

    setAuth: (payload: {
        token: string;
        refreshToken: string;
        user: User;
    }) => Promise<void>;

    setUser: (user: User | null) => void;

    clearAuth: () => Promise<void>;

    finishHydration: () => Promise<void>;
};

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,
            isHydrating: true,

            setAuth: async ({ token, refreshToken, user }) => {
                await saveTokens(token, refreshToken);

                set({
                    user,
                    isAuthenticated: true,
                });
            },

            setUser: (user) => {
                set({
                    user,
                    isAuthenticated: !!user,
                });
            },

            clearAuth: async () => {
                await deleteTokens();

                set({
                    user: null,
                    isAuthenticated: false,
                });
            },

            finishHydration: async () => {
                const token = await getAccessToken();

                if (!token) {
                    set({
                        user: null,
                        isAuthenticated: false,
                        isHydrating: false,
                    });

                    return;
                }

                set({
                    isHydrating: false,
                });
            },
        }),
        {
            name: "nc-auth",

            storage: createJSONStorage(() => AsyncStorage),

            partialize: (state) => ({
                user: state.user,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);