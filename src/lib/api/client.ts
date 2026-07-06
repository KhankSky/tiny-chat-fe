import type { ApiResponse } from "./types";
import { getAccessToken } from "@/lib/auth/session";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

export async function apiPost<TResponse, TBody>(
  path: string,
  body: TBody,
): Promise<TResponse> {
  const token = getAccessToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });

  const payload = (await response.json()) as ApiResponse<TResponse>;

  if (!response.ok) {
    throw new Error(payload.message || "Something went wrong");
  }

  if (!payload.data) {
    throw new Error(payload.message || "Missing response data");
  }

  return payload.data;
}

export async function apiPut<TResponse, TBody>(
  path: string,
  body: TBody,
): Promise<TResponse> {
  const token = getAccessToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });

  const payload = (await response.json()) as ApiResponse<TResponse>;

  if (!response.ok) {
    throw new Error(payload.message || "Something went wrong");
  }

  if (!payload.data) {
    throw new Error(payload.message || "Missing response data");
  }

  return payload.data;
}

export async function apiGet<TResponse>(path: string): Promise<TResponse> {
  const token = getAccessToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const payload = (await response.json()) as ApiResponse<TResponse>;

  if (!response.ok) {
    throw new Error(payload.message || "Something went wrong");
  }

  if (!payload.data) {
    throw new Error(payload.message || "Missing response data");
  }

  return payload.data;
}
