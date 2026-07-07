import type { AuthUserResponse } from "../api/types";

const ACCESS_TOKEN_KEY = "tiny-chat.access-token";
const AUTH_USER_KEY = "tiny-chat.auth-user";

export function persistAuthSession(user: AuthUserResponse) {
  if (typeof window === "undefined") return;

  localStorage.setItem(ACCESS_TOKEN_KEY, user.accessToken);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
}

export function getAccessToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getStoredAuthUser() {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(AUTH_USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}

export function updateStoredAuthUser(
  updater: (current: AuthUserResponse | null) => AuthUserResponse | null,
) {
  if (typeof window === "undefined") return null;

  const current = getStoredAuthUser() as AuthUserResponse | null;
  const next = updater(current);
  if (next) {
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(next));
  } else {
    localStorage.removeItem(AUTH_USER_KEY);
  }

  window.dispatchEvent(new Event("storage"));
  return next;
}

export function clearAuthSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
}
