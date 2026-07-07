type LogContext = Record<string, unknown>;

export function createRequestId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `req-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function formatContext(context?: LogContext) {
  return context && Object.keys(context).length > 0 ? context : undefined;
}

export function logClientError(message: string, context?: LogContext) {
  console.error(`[tiny-chat] ${message}`, formatContext(context));
}
