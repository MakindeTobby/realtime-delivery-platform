import type { User, UserResponse } from "@food-delivery/types";
import { api } from "@/lib/axios";
import { getRefreshToken } from "@/lib/auth";

export type VerificationDeliveryStatus =
  | "sent"
  | "development"
  | "unavailable"
  | "already-verified"
  | "cooldown";

export type AuthSessionResponse = UserResponse & {
  verificationDelivery?: { status: VerificationDeliveryStatus };
};

export type RegisterAccount = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
};

export const AuthApi = {
  async login(email: string, password: string) {
    const { data } = await api.post<AuthSessionResponse>("/auth/login", {
      email: email.trim().toLowerCase(),
      password,
    });
    return data;
  },

  async register(account: RegisterAccount) {
    const { data } = await api.post<AuthSessionResponse>("/auth/register", {
      ...account,
      email: account.email.trim().toLowerCase(),
    });
    return data;
  },

  async getCurrentUser() {
    const { data } = await api.get<User>("/auth/me");
    return data;
  },

  async verifyEmail(email: string, code: string) {
    await api.post("/auth/verify-email", {
      email: email.trim().toLowerCase(),
      code,
    });
  },

  async resendVerification(email: string) {
    const { data } = await api.post<{ status: VerificationDeliveryStatus }>(
      "/auth/resend-verification",
      { email: email.trim().toLowerCase() },
    );
    return data;
  },

  async logout() {
    const refreshToken = await getRefreshToken();
    if (refreshToken) {
      try {
        await api.post("/auth/logout", { refreshToken });
      } catch {
        // Callers clear local credentials even when the API is unreachable.
      }
    }
  },
};
