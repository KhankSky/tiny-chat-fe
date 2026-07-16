import type { AuthUserResponse } from "@/features/auth/types";

const AUTH_USER_KEY = "tiny-chat.auth-user";
export const AUTH_SESSION_CHANGED_EVENT = "tiny-chat:auth-session-changed";

let cachedAuthUserRaw: string | null | undefined;
let cachedAuthUser: AuthUserResponse | null = null;
let accessToken: string | null = null;

function readStoredAuthUser(): AuthUserResponse | null {
  const raw = localStorage.getItem(AUTH_USER_KEY);
  if (raw === cachedAuthUserRaw) {
    return cachedAuthUser;
  }

  cachedAuthUserRaw = raw;
  if (!raw) {
    cachedAuthUser = null;
    return cachedAuthUser;
  }

  try {
    cachedAuthUser = JSON.parse(raw) as AuthUserResponse;
  } catch {
    cachedAuthUser = null;
  }

  return cachedAuthUser;
}

export function persistAuthSession(user: AuthUserResponse) {
  if (typeof window === "undefined") return;

  accessToken = user.accessToken;
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  cachedAuthUserRaw = null;
}

export function getAccessToken() {
  if (typeof window === "undefined") return null;
  return accessToken;
}

export function setAccessToken(token: string) {
  accessToken = token;
}

export function getStoredAuthUser() {
  if (typeof window === "undefined") return null;
  return readStoredAuthUser();
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
  cachedAuthUserRaw = null;

  window.dispatchEvent(new Event(AUTH_SESSION_CHANGED_EVENT));
  return next;
}

export function clearAuthSession() {
  if (typeof window === "undefined") return;
  accessToken = null;
  localStorage.removeItem(AUTH_USER_KEY);
  cachedAuthUserRaw = null;
  window.dispatchEvent(new Event(AUTH_SESSION_CHANGED_EVENT));
}

export function subscribeAuthSession(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  function handleSessionChanged() {
    onStoreChange();
  }

  function handleStorage(event: StorageEvent) {
    if (!event.key || event.key === AUTH_USER_KEY) {
      onStoreChange();
    }
  }

  window.addEventListener(AUTH_SESSION_CHANGED_EVENT, handleSessionChanged);
  window.addEventListener("storage", handleStorage);
  return () => {
    window.removeEventListener(AUTH_SESSION_CHANGED_EVENT, handleSessionChanged);
    window.removeEventListener("storage", handleStorage);
  };
}
