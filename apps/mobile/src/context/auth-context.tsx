import React, { createContext, useContext, useEffect, useState } from "react";
import { api } from "@/lib/axios";
import {
  deleteTokens,
  getAccessToken,
  getRefreshToken,
  saveTokens,
} from "@/lib/auth";
import { User } from "@food-delivery/types";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
}

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

const AuthContext = createContext<AuthContextType | null>(null);
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    checkExistingSession();
  }, []);

  async function checkExistingSession() {
    try {
      const accessToken = await getAccessToken();
      const refreshToken = await getRefreshToken();

      if (accessToken) {
        const res = await api.get("/auth/me");
        setUser(res.data);
      } else if (refreshToken) {
        const res = await api.post("/auth/refresh", { refreshToken });
        await saveTokens(res.data.accessToken, res.data.refreshToken);
        setUser(res.data.user);
      } else {
        await deleteTokens();
      }
    } catch (error) {
      await deleteTokens();
    } finally {
      setIsLoading(false);
    }
  }

  async function login(email: string, password: string) {
    const res = await api.post("/auth/login", { email, password });
    await saveTokens(res.data.accessToken, res.data.refreshToken);
    setUser(res.data.user);
  }
  async function register(data: RegisterData) {
    const res = await api.post("/auth/register", data);
    await saveTokens(res.data.accessToken, res.data.refreshToken);
    setUser(res.data.user);
  }
  async function logout() {
    try {
      const refreshToken = await getRefreshToken();
      if (refreshToken) await api.post("/auth/logout", { refreshToken });
    } catch {
      // Always clear credentials locally, even if the API is unreachable.
    } finally {
      await deleteTokens();
      setUser(null);
    }
  }
  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
};
