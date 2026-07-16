import type { ApiResponse } from "./types";
import { getApiBaseUrl } from "./base-url";
import { clearAuthSession, getAccessToken, setAccessToken } from "@/shared/auth/session";
import { createRequestId, logClientError } from "@/shared/lib/logger";

type HttpMethod = "GET" | "POST" | "PUT";

async function restoreAccessToken() {
  if (getAccessToken()) return;
  try {
    const response = await fetch(`${getApiBaseUrl()}/api/auth/p/refresh`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) return;
    const payload = await response.json() as ApiResponse<{ accessToken: string }>;
    if (payload.data?.accessToken) setAccessToken(payload.data.accessToken);
  } catch {
    // Anonymous requests continue without an access token.
  }
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

export async function apiPost<TResponse, TBody>(
  path: string,
  body?: TBody,
): Promise<TResponse> {
  const requestId = createRequestId();
  const token = getAccessToken();
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    method: "POST",
    credentials: "include",
    headers: buildHeaders(token, requestId),
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
  const token = getAccessToken();
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    method: "POST",
    credentials: "include",
    headers: {
      "X-Request-Id": requestId,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
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
  const token = getAccessToken();
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    method: "PUT",
    credentials: "include",
    headers: buildHeaders(token, requestId),
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
  await restoreAccessToken();
  const requestId = createRequestId();
  const token = getAccessToken();
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    credentials: "include",
    headers: {
      "X-Request-Id": requestId,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
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
