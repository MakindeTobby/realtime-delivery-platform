export type AuthSession = {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresIn: number;
};

const AUTH_SESSION_KEY = "food-delivery.auth-session";

export function getAuthSession(): AuthSession | null {
  if (typeof window === "undefined") return null;
  const raw = window.sessionStorage.getItem(AUTH_SESSION_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as AuthSession;
  } catch {
    window.sessionStorage.removeItem(AUTH_SESSION_KEY);
    return null;
  }
}

export function getAccessToken() {
  return getAuthSession()?.accessToken ?? null;
}

export function saveAuthSession(session: AuthSession) {
  window.sessionStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
}

export function clearAuthSession() {
  window.sessionStorage.removeItem(AUTH_SESSION_KEY);
}
