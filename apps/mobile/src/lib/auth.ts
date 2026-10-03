// lib/auth-storage.ts

import * as SecureStore from "expo-secure-store";

const ACCESS_TOKEN_KEY = "fda_access_token";
const REFRESH_TOKEN_KEY = "fda_refresh_token";
const LEGACY_TOKEN_KEY = "auth_token";

export async function saveTokens(accessToken: string, refreshToken: string) {
  await Promise.all([
    SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken),

    SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken),
  ]);

  await SecureStore.deleteItemAsync(LEGACY_TOKEN_KEY);
}

export function getAccessToken() {
  return SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
}

export function getRefreshToken() {
  return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
}

export async function deleteTokens() {
  await Promise.all([
    SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY),

    SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),

    SecureStore.deleteItemAsync(LEGACY_TOKEN_KEY),
  ]);
}
