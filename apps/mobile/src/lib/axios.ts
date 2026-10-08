import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import {
  deleteTokens,
  getAccessToken,
  getRefreshToken,
  saveTokens,
} from './auth';

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(async (config) => {
  const token = await getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

type RetryableRequest = InternalAxiosRequestConfig & { _retry?: boolean };

let refreshRequest: Promise<string> | null = null;

async function refreshAccessToken() {
  if (!refreshRequest) {
    refreshRequest = (async () => {
      const refreshToken = await getRefreshToken();
      if (!refreshToken) throw new Error('No refresh token is available');

      const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
        refreshToken,
      });
      const {
        accessToken,
        refreshToken: rotatedRefreshToken,
      }: { accessToken: string; refreshToken: string } = response.data;

      await saveTokens(accessToken, rotatedRefreshToken);
      return accessToken;
    })()
      .catch(async (error: unknown) => {
        const { useAuthStore } = await import("@/store/auth");
        await useAuthStore.getState().clearAuth();
        throw error;
      })
      .finally(() => {
        refreshRequest = null;
      });
  }

  return refreshRequest;
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as RetryableRequest | undefined;
    const authEndpoint = /^\/auth\/(login|register|refresh|logout)$/.test(
      config?.url ?? '',
    );

    if (
      error.response?.status !== 401 ||
      !config ||
      config._retry ||
      authEndpoint
    ) {
      return Promise.reject(error);
    }

    config._retry = true;
    try {
      const accessToken = await refreshAccessToken();
      config.headers.Authorization = `Bearer ${accessToken}`;
      return api.request(config);
    } catch (refreshError) {
      await deleteTokens();
      return Promise.reject(refreshError);
    }
  },
);
