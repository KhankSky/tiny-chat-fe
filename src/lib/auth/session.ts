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

