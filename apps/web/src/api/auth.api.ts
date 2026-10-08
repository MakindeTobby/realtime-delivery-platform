import { api, publicApi } from "@/lib/axios";

export type PartnerExistence = {
  exists: boolean;
  userName?: string;
  message?: string;
};

export type AuthUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  emailVerified: boolean;
  roles: string[];
};

export type AuthSessionResponse = {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresIn: number;
  verificationDelivery?: VerificationDelivery;
};

export type VerificationDelivery = {
  status: "sent" | "development" | "unavailable" | "already-verified" | "cooldown";
};

export type RegisterAccount = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
};

export const authApi = {
  async checkPartner(email: string) {
    const { data } = await publicApi.post<PartnerExistence>(
      "/auth/partner/check-existence",
      { email },
    );
    return data;
  },

  async login(email: string, password: string) {
    const { data } = await publicApi.post<AuthSessionResponse>("/auth/login", {
      email,
      password,
    });
    return data;
  },

  async logout(refreshToken: string) {
    const { data } = await publicApi.post<{ success: boolean }>("/auth/logout", {
      refreshToken,
    });
    return data;
  },

  async register(input: RegisterAccount) {
    const { data } = await publicApi.post<AuthSessionResponse>(
      "/auth/register",
      input,
    );
    return data;
  },

  async getCurrentUser() {
    const { data } = await api.get<AuthUser>("/auth/me");
    return data;
  },

  async verifyEmail(email: string, code: string) {
    const { data } = await publicApi.post("/auth/verify-email", { email, code });
    return data;
  },

  async resendVerification(email: string) {
    const { data } = await publicApi.post<VerificationDelivery>(
      "/auth/resend-verification",
      { email },
    );
    return data;
  },
};
