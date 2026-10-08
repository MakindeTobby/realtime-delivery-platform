import axios, { type InternalAxiosRequestConfig } from "axios";
import {
  clearAuthSession,
  getAccessToken,
  getAuthSession,
  saveAuthSession,
  type AuthSession,
} from "./auth-session";

const BASE_URL = import.meta.env.VITE_API_URL || "/api";

export const publicApi = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

type RetryableRequest = InternalAxiosRequestConfig & { _retry?: boolean };

let refreshRequest: Promise<string> | null = null;

function isAuthEndpoint(url = "") {
  return /(?:^|\/)auth\/(?:login|register|refresh|logout)(?:\?|$)/.test(url);
}

async function refreshAccessToken() {
  if (!refreshRequest) {
    refreshRequest = (async () => {
      const session = getAuthSession();
      if (!session?.refreshToken) throw new Error("No refresh token is available");

      const { data } = await publicApi.post<AuthSession>("/auth/refresh", {
        refreshToken: session.refreshToken,
      });
      saveAuthSession(data);
      return data.accessToken;
    })().finally(() => {
      refreshRequest = null;
    });
  }

  return refreshRequest;
}

function sendToLogin() {
  if (typeof window === "undefined") return;
  const { pathname, search } = window.location;
  if (pathname === "/login") return;

  const next = `${pathname}${search}`;
  window.location.replace(`/login?next=${encodeURIComponent(next)}`);
}

api.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError(error) || error.response?.status !== 401) {
      return Promise.reject(error);
    }

    const config = error.config as RetryableRequest | undefined;
    if (!config || isAuthEndpoint(config.url)) {
      return Promise.reject(error);
    }

    if (config._retry) {
      clearAuthSession();
      sendToLogin();
      return Promise.reject(error);
    }

    config._retry = true;

    try {
      const latestToken = getAccessToken();
      const sentAuthorization = config.headers?.Authorization;

      // Another request may already have rotated the token while this one
      // was waiting for its 401 response. Reuse that token instead of rotating
      // the refresh token a second time.
      let accessToken: string;
      if (latestToken && sentAuthorization !== `Bearer ${latestToken}`) {
        accessToken = latestToken;
      } else {
        accessToken = await refreshAccessToken();
      }

      config.headers.Authorization = `Bearer ${accessToken}`;
      return api.request(config);
    } catch (refreshError) {
      const refreshStatus = axios.isAxiosError(refreshError)
        ? refreshError.response?.status
        : undefined;
      const hasRefreshToken = Boolean(getAuthSession()?.refreshToken);
      const sessionRejected = refreshStatus === 401 || refreshStatus === 403;
      const refreshTokenMissing = !hasRefreshToken;

      if (sessionRejected || refreshTokenMissing) {
        clearAuthSession();
        sendToLogin();
      }
      return Promise.reject(refreshError);
    }
  },
);
