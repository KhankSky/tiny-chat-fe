import { createRequestId, logClientError } from "@/lib/logger";

type Headers = Record<string, string>;

type Frame = {
  command: string;
  headers: Headers;
  body: string;
};

type MessageHandler = (body: string, frame: Frame) => void;

function escapeHeaderValue(value: string) {
  return value
    .replaceAll("\\", "\\\\")
    .replaceAll("\r", "\\r")
    .replaceAll("\n", "\\n")
    .replaceAll(":", "\\c");
}

function buildFrame(command: string, headers: Headers = {}, body = "") {
  const headerLines = Object.entries(headers).map(
    ([key, value]) => `${key}:${escapeHeaderValue(value)}`,
  );
  const payload = [command, ...headerLines, "", body].join("\n");
  return `${payload}\0`;
}

function parseFrame(rawFrame: string): Frame | null {
  const cleaned = rawFrame.replace(/^\u0000+|\u0000+$/g, "");
  if (!cleaned.trim()) return null;

  const separatorIndex = cleaned.indexOf("\n\n");
  const headerBlock = separatorIndex >= 0 ? cleaned.slice(0, separatorIndex) : cleaned;
  const body = separatorIndex >= 0 ? cleaned.slice(separatorIndex + 2) : "";
  const lines = headerBlock.split("\n");
  const command = lines.shift()?.trim();

  if (!command) return null;

  const headers: Headers = {};
  for (const line of lines) {
    const colonIndex = line.indexOf(":");
    if (colonIndex <= 0) continue;
    const key = line.slice(0, colonIndex);
    const value = line.slice(colonIndex + 1)
      .replaceAll("\\c", ":")
      .replaceAll("\\n", "\n")
      .replaceAll("\\r", "\r")
      .replaceAll("\\\\", "\\");
    headers[key] = value;
  }

  return { command, headers, body };
}

function getWebSocketBaseUrl() {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";
  const url = new URL(apiBaseUrl);
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  url.pathname = "/ws";
  url.search = "";
  url.hash = "";
  return url.toString();
}

export class StompClient {
  private socket: WebSocket | null = null;
  private buffer = "";
  private subscriptions = new Map<string, MessageHandler>();
  private connected = false;
  private connectPromise: Promise<void> | null = null;
  private connectResolve: (() => void) | null = null;
  private connectReject: ((error: Error) => void) | null = null;
  private disconnectRequested = false;
  private connectionId: string | null = null;

  constructor(private readonly token: string) {}

  connect() {
    if (this.connected) {
      return Promise.resolve();
    }

    if (this.connectPromise) {
      return this.connectPromise;
    }

    this.disconnectRequested = false;
    this.connectionId = createRequestId();
    this.connectPromise = new Promise<void>((resolve, reject) => {
      this.connectResolve = resolve;
      this.connectReject = reject;

      const socket = new WebSocket(getWebSocketBaseUrl());
      this.socket = socket;

      socket.onopen = () => {
        socket.send(
          buildFrame("CONNECT", {
            "accept-version": "1.2",
            host: window.location.host,
            Authorization: `Bearer ${this.token}`,
            "X-Request-Id": this.connectionId ?? createRequestId(),
          }),
        );
      };

      socket.onmessage = (event) => {
        this.buffer += typeof event.data === "string" ? event.data : "";
        this.drainBuffer();
      };

      socket.onerror = () => {
        logClientError("WebSocket connection failed", {
          connectionId: this.connectionId,
          url: getWebSocketBaseUrl(),
        });
        this.failConnection(new Error("WebSocket connection failed"));
      };

      socket.onclose = () => {
        this.connected = false;
        if (!this.disconnectRequested) {
          logClientError("WebSocket disconnected unexpectedly", {
            connectionId: this.connectionId,
            url: getWebSocketBaseUrl(),
          });
          this.failConnection(new Error("WebSocket disconnected"));
        }
      };
    });

    return this.connectPromise;
  }

  subscribe(destination: string, handler: MessageHandler) {
    const subscriptionId = `sub-${crypto.randomUUID()}`;
    this.subscriptions.set(subscriptionId, handler);

    this.sendRaw(
      buildFrame("SUBSCRIBE", {
        id: subscriptionId,
        destination,
      }),
    );

    return () => {
      this.subscriptions.delete(subscriptionId);
      this.sendRaw(buildFrame("UNSUBSCRIBE", { id: subscriptionId }));
    };
  }

  send(destination: string, body: unknown) {
    this.sendRaw(
      buildFrame(
        "SEND",
        {
          destination,
          "content-type": "application/json",
        },
        JSON.stringify(body),
      ),
    );
  }

  disconnect() {
    this.disconnectRequested = true;
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(buildFrame("DISCONNECT"));
    }
    this.socket?.close();
    this.socket = null;
    this.connected = false;
    this.connectPromise = null;
    this.connectResolve = null;
    this.connectReject = null;
    this.buffer = "";
    this.subscriptions.clear();
    this.connectionId = null;
  }

  private sendRaw(frame: string) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      logClientError("WebSocket send attempted while disconnected", {
        connectionId: this.connectionId,
      });
      throw new Error("WebSocket is not connected");
    }
    this.socket.send(frame);
  }

  private drainBuffer() {
    while (true) {
      const delimiterIndex = this.buffer.indexOf("\0");
      if (delimiterIndex < 0) break;

      const rawFrame = this.buffer.slice(0, delimiterIndex);
      this.buffer = this.buffer.slice(delimiterIndex + 1);
      const frame = parseFrame(rawFrame);
      if (!frame) continue;

      if (frame.command === "CONNECTED") {
        this.connected = true;
        this.connectResolve?.();
        this.connectResolve = null;
        this.connectReject = null;
        this.connectPromise = Promise.resolve();
        continue;
      }

      if (frame.command === "ERROR") {
        logClientError("WebSocket error frame received", {
          connectionId: this.connectionId,
          message: frame.body || "WebSocket error",
        });
        this.failConnection(new Error(frame.body || "WebSocket error"));
        continue;
      }

      if (frame.command === "MESSAGE") {
        const subscriptionId = frame.headers.subscription;
        if (subscriptionId && this.subscriptions.has(subscriptionId)) {
          this.subscriptions.get(subscriptionId)?.(frame.body, frame);
        }
      }
    }
  }

  private failConnection(error: Error) {
    if (this.connectReject) {
      this.connectReject(error);
    }
    this.connectReject = null;
    this.connectResolve = null;
    this.connectPromise = null;
  }
}
