import type { User, UserResponse, UserRole } from "@food-delivery/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { api } from "@/lib/axios";
import {
  deleteTokens,
  getAccessToken,
  getRefreshToken,
  saveTokens,
} from "@/lib/auth";
import type { VerificationDeliveryStatus } from "@/api/auth";

const MOBILE_ROLES: UserRole[] = [
  "CUSTOMER",
  "RESTAURANT_OWNER",
  "DRIVER",
];

type AuthState = {
  user: User | null;
  activeRole: UserRole | null;
  isAuthenticated: boolean;
  isHydrating: boolean;
  verificationDelivery: VerificationDeliveryStatus | null;
  setAuth: (
    session: UserResponse & {
      verificationDelivery?: { status: VerificationDeliveryStatus };
    },
  ) => Promise<void>;
  setUser: (user: User | null) => void;
  setActiveRole: (role: UserRole) => void;
  setVerificationDelivery: (status: VerificationDeliveryStatus | null) => void;
  clearAuth: () => Promise<void>;
  finishHydration: () => Promise<void>;
};

function supportedRoles(user: User) {
  return user.roles.filter((role) => MOBILE_ROLES.includes(role));
}

function canAccessMobileRole(user: User, role: UserRole | null) {
  return role !== null && supportedRoles(user).includes(role);
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      activeRole: null,
      isAuthenticated: false,
      isHydrating: true,
      verificationDelivery: null,

      setAuth: async (session) => {
        await saveTokens(session.accessToken, session.refreshToken);
        const roles = supportedRoles(session.user);
        set({
          user: session.user,
          activeRole: roles.length === 1 ? roles[0] : null,
          isAuthenticated: true,
          verificationDelivery: session.verificationDelivery?.status ?? null,
        });
      },

      setUser: (user) => {
        const roles = user ? supportedRoles(user) : [];
        const activeRole = user && canAccessMobileRole(user, get().activeRole)
          ? get().activeRole
          : roles.length === 1
            ? roles[0]
            : null;
        set({ user, activeRole, isAuthenticated: Boolean(user) });
      },

      setActiveRole: (role) => {
        const user = get().user;
        if (user && canAccessMobileRole(user, role)) set({ activeRole: role });
      },

      setVerificationDelivery: (verificationDelivery) =>
        set({ verificationDelivery }),

      clearAuth: async () => {
        await deleteTokens();
        set({
          user: null,
          activeRole: null,
          isAuthenticated: false,
          verificationDelivery: null,
        });
      },

      finishHydration: async () => {
        if (!get().isHydrating) return;

        try {
          const accessToken = await getAccessToken();
          const refreshToken = await getRefreshToken();

          if (!accessToken && !refreshToken) {
            set({
              user: null,
              activeRole: null,
              isAuthenticated: false,
              isHydrating: false,
            });
            return;
          }

          let currentUser: User;
          if (accessToken) {
            const { data } = await api.get<User>("/auth/me");
            currentUser = data;
          } else {
            const { data } = await api.post<UserResponse>("/auth/refresh", {
              refreshToken,
            });
            await saveTokens(data.accessToken, data.refreshToken);
            currentUser = data.user;
          }

          const roles = supportedRoles(currentUser);
          const previousRole = get().activeRole;
          const activeRole = currentUser.roles.includes(previousRole as UserRole) &&
            canAccessMobileRole(currentUser, previousRole)
            ? previousRole
            : roles.length === 1
              ? roles[0]
              : null;

          set({
            user: currentUser,
            activeRole,
            isAuthenticated: true,
            isHydrating: false,
          });
        } catch (error) {
          const status =
            typeof error === "object" && error !== null && "response" in error
              ? (error as { response?: { status?: number } }).response?.status
              : undefined;

          if (status === 401 || status === 403) {
            await deleteTokens();
            set({
              user: null,
              activeRole: null,
              isAuthenticated: false,
              isHydrating: false,
            });
            return;
          }

          // Preserve the cached profile during a temporary network outage.
          // Protected API calls still require a valid server session.
          set({ isHydrating: false });
        }
      },
    }),
    {
      name: "nc-auth",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        activeRole: state.activeRole,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
