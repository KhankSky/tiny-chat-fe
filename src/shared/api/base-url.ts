const DEFAULT_DEV_API_BASE_URL = "http://localhost:8080";

function isLocalFrontendOrigin(origin: string) {
  try {
    const url = new URL(origin);
    const isLocalHost =
      url.hostname === "localhost" ||
      url.hostname === "127.0.0.1" ||
      url.hostname === "[::1]" ||
      url.hostname === "::1";
    return isLocalHost && url.port === "3000";
  } catch {
    return false;
  }
}

export function getApiBaseUrl() {
  if (process.env.NEXT_PUBLIC_API_BASE_URL) {
    return process.env.NEXT_PUBLIC_API_BASE_URL;
  }

  if (typeof window !== "undefined") {
    if (isLocalFrontendOrigin(window.location.origin)) {
      return DEFAULT_DEV_API_BASE_URL;
    }
    return window.location.origin;
  }

  return DEFAULT_DEV_API_BASE_URL;
}
