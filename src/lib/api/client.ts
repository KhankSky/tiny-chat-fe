import type { ApiResponse } from "./types";
import { getAccessToken } from "@/lib/auth/session";
import { createRequestId, logClientError } from "@/lib/logger";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

type HttpMethod = "GET" | "POST" | "PUT";

export function apiAssetUrl(path: string | null | undefined, fallback = "/image/logo-default.jpg") {
  const assetPath = path || fallback;
  if (assetPath.startsWith("http://") || assetPath.startsWith("https://") || assetPath.startsWith("data:")) {
    return assetPath;
  }
  return `${API_BASE_URL}${assetPath.startsWith("/") ? assetPath : `/${assetPath}`}`;
}

async function readJsonResponse<TResponse>(
  response: Response,
  method: HttpMethod,
  path: string,
  requestId: string,
) {
  try {
    return (await response.json()) as ApiResponse<TResponse>;
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
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
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
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
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
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "PUT",
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
  const requestId = createRequestId();
  const token = getAccessToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
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
