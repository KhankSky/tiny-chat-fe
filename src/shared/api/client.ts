import type { ApiResponse } from "./types";
import { getApiBaseUrl } from "./base-url";
import { clearAuthSession, getAccessToken, setAccessToken } from "@/shared/auth/session";
import { createRequestId, logClientError } from "@/shared/lib/logger";

type HttpMethod = "GET" | "POST" | "PUT";

let refreshRequest: Promise<string | null> | null = null;

const PUBLIC_AUTH_PATHS = new Set([
  "/api/auth/p/login",
  "/api/auth/p/register",
  "/api/auth/p/google",
  "/api/auth/p/refresh",
]);

async function requestRefresh(): Promise<string | null> {
  try {
    const response = await fetch(`${getApiBaseUrl()}/api/auth/p/refresh`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) return null;

    const payload = await response.json() as ApiResponse<{ accessToken: string }>;
    const nextToken = payload.data?.accessToken ?? null;
    if (nextToken) setAccessToken(nextToken);
    return nextToken;
  } catch {
    return null;
  }
}

function refreshAccessToken(): Promise<string | null> {
  if (!refreshRequest) {
    refreshRequest = requestRefresh().finally(() => {
      refreshRequest = null;
    });
  }
  return refreshRequest;
}

async function restoreAccessToken(): Promise<string | null> {
  const currentToken = getAccessToken();
  if (currentToken) return currentToken;

  // All concurrent requests share one refresh call. This is important because
  // the backend rotates refresh tokens and rejects reuse of the old token.
  return refreshAccessToken();
}

export async function logout(allSessions = false) {
  const response = await fetch(`${getApiBaseUrl()}/api/auth/${allSessions ? "logout-all" : "p/logout"}`, {
    method: "POST",
    credentials: "include",
  });
  if (!response.ok && response.status !== 204) throw new Error(`Logout failed (${response.status})`);
  clearAuthSession();
}

export function apiAssetUrl(path: string | null | undefined, fallback = "/image/logo-default.jpg") {
  const apiBaseUrl = getApiBaseUrl();
  const assetPath = path || fallback;
  if (
    assetPath.startsWith("http://") ||
    assetPath.startsWith("https://") ||
    assetPath.startsWith("data:") ||
    assetPath.startsWith("blob:")
  ) {
    return assetPath;
  }
  return `${apiBaseUrl}${assetPath.startsWith("/") ? assetPath : `/${assetPath}`}`;
}

async function readJsonResponse<TResponse>(
  response: Response,
  method: HttpMethod,
  path: string,
  requestId: string,
) {
  try {
    const text = await response.text();
    if (!text.trim()) {
      return { message: `Request failed with HTTP ${response.status}` } as ApiResponse<TResponse>;
    }
    return JSON.parse(text) as ApiResponse<TResponse>;
  } catch (error) {
    logClientError("Failed to parse API response", {
      method,
      path,
      requestId,
      status: response.status,
      error: error instanceof Error ? error.message : "Unknown error",
    });
    throw new Error("Failed to parse API response");
  }
}

function buildHeaders(token: string | null, requestId: string) {
  return {
    "Content-Type": "application/json",
    "X-Request-Id": requestId,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function executeRequest(
  path: string,
  requestId: string,
  init: RequestInit,
): Promise<Response> {
  // Public auth endpoints must not try to restore a session first. Otherwise
  // a stale refresh cookie causes login/register to call /refresh before the
  // actual auth request.
  if (!PUBLIC_AUTH_PATHS.has(path)) {
    await restoreAccessToken();
  }
  let token = getAccessToken();
  let response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    headers: {
      ...init.headers,
      ...buildHeaders(token, requestId),
    },
  });

  if (response.status !== 401 || path === "/api/auth/p/refresh") {
    return response;
  }

  const refreshedToken = await refreshAccessToken();
  if (!refreshedToken) {
    clearAuthSession();
    return response;
  }

  token = refreshedToken;
  response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    headers: {
      ...init.headers,
      ...buildHeaders(token, requestId),
    },
  });
  return response;
}

export async function apiPost<TResponse, TBody>(
  path: string,
  body?: TBody,
): Promise<TResponse> {
  const requestId = createRequestId();
  const response = await executeRequest(path, requestId, {
    method: "POST",
    credentials: "include",
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const payload = await readJsonResponse<TResponse>(response, "POST", path, requestId);

  if (!response.ok) {
    logClientError("API request failed", {
      method: "POST",
      path,
      requestId,
      status: response.status,
      message: payload.message || "Something went wrong",
      code: payload.code,
    });
    throw new Error(payload.message || "Something went wrong");
  }

  if (!payload.data) {
    logClientError("API response was missing data", {
      method: "POST",
      path,
      requestId,
      status: response.status,
      message: payload.message || "Missing response data",
    });
    throw new Error(payload.message || "Missing response data");
  }

  return payload.data;
}

export async function apiUpload<TResponse>(
  path: string,
  formData: FormData,
): Promise<TResponse> {
  const requestId = createRequestId();
  const response = await executeRequest(path, requestId, {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  const payload = await readJsonResponse<TResponse>(response, "POST", path, requestId);

  if (!response.ok) {
    logClientError("API upload failed", {
      method: "POST",
      path,
      requestId,
      status: response.status,
      message: payload.message || "Something went wrong",
      code: payload.code,
    });
    throw new Error(payload.message || "Something went wrong");
  }

  if (!payload.data) {
    logClientError("API upload response was missing data", {
      method: "POST",
      path,
      requestId,
      status: response.status,
      message: payload.message || "Missing response data",
    });
    throw new Error(payload.message || "Missing response data");
  }

  return payload.data;
}

export async function apiPut<TResponse, TBody>(
  path: string,
  body: TBody,
): Promise<TResponse> {
  const requestId = createRequestId();
  const response = await executeRequest(path, requestId, {
    method: "PUT",
    credentials: "include",
    body: JSON.stringify(body),
  });

  const payload = await readJsonResponse<TResponse>(response, "PUT", path, requestId);

  if (!response.ok) {
    logClientError("API request failed", {
      method: "PUT",
      path,
      requestId,
      status: response.status,
      message: payload.message || "Something went wrong",
      code: payload.code,
    });
    throw new Error(payload.message || "Something went wrong");
  }

  if (!payload.data) {
    logClientError("API response was missing data", {
      method: "PUT",
      path,
      requestId,
      status: response.status,
      message: payload.message || "Missing response data",
    });
    throw new Error(payload.message || "Missing response data");
  }

  return payload.data;
}

export async function apiGet<TResponse>(path: string): Promise<TResponse> {
  const requestId = createRequestId();
  const response = await executeRequest(path, requestId, {
    method: "GET",
    credentials: "include",
  });

  const payload = await readJsonResponse<TResponse>(response, "GET", path, requestId);

  if (!response.ok) {
    logClientError("API request failed", {
      method: "GET",
      path,
      requestId,
      status: response.status,
      message: payload.message || "Something went wrong",
      code: payload.code,
    });
    throw new Error(payload.message || "Something went wrong");
  }

  if (!payload.data) {
    logClientError("API response was missing data", {
      method: "GET",
      path,
      requestId,
      status: response.status,
      message: payload.message || "Missing response data",
    });
    throw new Error(payload.message || "Missing response data");
  }

  return payload.data;
}
