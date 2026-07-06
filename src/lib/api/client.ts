import type { ApiResponse } from "./types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

export async function apiPost<TResponse, TBody>(
  path: string,
  body: TBody,
): Promise<TResponse> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
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

