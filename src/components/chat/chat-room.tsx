"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { apiGet } from "@/lib/api/client";
import { getAccessToken, getStoredAuthUser } from "@/lib/auth/session";
import { StompClient } from "@/lib/realtime/stomp";
import type { Locale } from "@/i18n/types";

type ChatMessage = {
  messageId: number;
  groupId: number;
  senderId: number;
  senderName: string;
  senderAvatarUrl: string | null;
  content: string;
  sentAt: string;
};

type HistoryResponse = {
  groupId: number;
  messages: ChatMessage[];
};

type SocketStatus = "idle" | "connecting" | "connected" | "error";

function parseChatMessage(payload: string) {
  return JSON.parse(payload) as ChatMessage;
}

export function ChatRoom({
  locale,
  groupId,
}: {
  locale: Locale;
  groupId: number;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [socketStatus, setSocketStatus] = useState<SocketStatus>("idle");
  const [socketError, setSocketError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const stompClientRef = useRef<StompClient | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const currentUser = useMemo(
    () =>
      getStoredAuthUser() as {
        userId?: number;
        email?: string;
        displayName?: string;
      } | null,
    [],
  );
  const accessToken = useMemo(() => getAccessToken(), []);

  useEffect(() => {
    let active = true;
    const client = accessToken ? new StompClient(accessToken) : null;
    stompClientRef.current = client;

    async function loadHistoryAndConnect() {
      try {
        setLoading(true);
        setError(null);
        const history = await apiGet<HistoryResponse>(`/api/groups/${groupId}/messages`);
        if (active) {
          setMessages(history.messages);
        }

        if (!client) {
          if (active) {
            setSocketStatus("error");
            setSocketError(
              locale === "vi"
                ? "Bạn cần đăng nhập để chat realtime."
                : "You need to sign in to chat in realtime.",
            );
          }
          return;
        }

        if (active) {
          setSocketStatus("connecting");
          setSocketError(null);
        }

        await client.connect();
        if (!active) return;

        setSocketStatus("connected");
        unsubscribeRef.current = client.subscribe(
          `/topic/groups/${groupId}/messages`,
          (body) => {
            if (!active) return;
            try {
              const nextMessage = parseChatMessage(body);
              setMessages((prev) => {
                if (prev.some((message) => message.messageId === nextMessage.messageId)) {
                  return prev;
                }
                return [...prev, nextMessage];
              });
            } catch {
              setSocketError(
                locale === "vi"
                  ? "Nhận dữ liệu chat không hợp lệ."
                  : "Received invalid chat data.",
              );
            }
          },
        );
      } catch (err) {
        if (active) {
          const message = err instanceof Error ? err.message : "Failed to load messages";
          if (message.toLowerCase().includes("websocket")) {
            setSocketStatus("error");
            setSocketError(message);
          } else {
            setError(message);
          }
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadHistoryAndConnect();

    return () => {
      active = false;
      unsubscribeRef.current?.();
      unsubscribeRef.current = null;
      stompClientRef.current?.disconnect();
      stompClientRef.current = null;
    };
  }, [accessToken, groupId, locale]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  async function handleSend() {
    const trimmed = content.trim();
    if (!trimmed) return;

    try {
      if (!stompClientRef.current) {
        throw new Error(
          locale === "vi"
            ? "Chưa kết nối được realtime."
            : "Realtime is not connected yet.",
        );
      }

      stompClientRef.current.send(`/app/groups/${groupId}/messages`, {
        content: trimmed,
      });
      setContent("");
    } catch (err) {
      setSocketError(err instanceof Error ? err.message : "Failed to send message");
    }
  }

  return (
    <section className="flex min-h-[calc(100vh-3rem)] flex-col rounded-[2rem] border border-white/10 bg-slate-950/80">
      <header className="flex items-center justify-between border-b border-white/10 px-6 py-4">
        <div>
          <p className="text-sm text-slate-400">
            {locale === "vi" ? "Phòng trò chuyện nhóm" : "Group conversation room"}
          </p>
          <h2 className="text-xl font-semibold text-white">Group #{groupId}</h2>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`rounded-full border px-3 py-1 text-xs ${
              socketStatus === "connected"
                ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
                : socketStatus === "connecting"
                  ? "border-cyan-400/30 bg-cyan-400/10 text-cyan-200"
                  : socketStatus === "error"
                    ? "border-red-400/30 bg-red-400/10 text-red-200"
                    : "border-white/10 bg-white/5 text-slate-300"
            }`}
          >
            {socketStatus === "connected"
              ? locale === "vi"
                ? "Đang realtime"
                : "Live"
              : socketStatus === "connecting"
                ? locale === "vi"
                  ? "Đang kết nối"
                  : "Connecting"
                : socketStatus === "error"
                  ? locale === "vi"
                    ? "Mất kết nối"
                    : "Offline"
                  : locale === "vi"
                    ? "Chưa sẵn sàng"
                    : "Idle"}
          </span>
          <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
            {currentUser ? currentUser.email ?? "Logged in" : "Anonymous"}
          </div>
        </div>
      </header>

      <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
        {loading ? (
          <p className="text-sm text-slate-400">
            {locale === "vi" ? "Đang tải..." : "Loading..."}
          </p>
        ) : null}

        {error ? (
          <p className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </p>
        ) : null}

        {socketError ? (
          <p className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
            {socketError}
          </p>
        ) : null}

        {messages.map((message) => {
          const isMine = currentUser?.userId === message.senderId;
          return (
            <div
              key={message.messageId}
              className={`flex ${isMine ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] rounded-3xl px-4 py-3 text-sm leading-7 ${
                  isMine
                    ? "bg-cyan-400 text-slate-950"
                    : "border border-white/10 bg-white/5 text-white"
                }`}
              >
                <div className="mb-1 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.25em] opacity-70">
                  <span>{message.senderName}</span>
                  <span>·</span>
                  <span>{new Date(message.sentAt).toLocaleString()}</span>
                </div>
                <p>{message.content}</p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-white/10 p-4">
        <div className="flex gap-3">
          <input
            value={content}
            onChange={(event) => setContent(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                void handleSend();
              }
            }}
            className="min-h-12 flex-1 rounded-full border border-white/10 bg-white/5 px-5 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/50 disabled:cursor-not-allowed disabled:opacity-60"
            placeholder={
              socketStatus === "connected"
                ? locale === "vi"
                  ? "Nhập tin nhắn..."
                  : "Write a message..."
                : locale === "vi"
                  ? "Đang chờ kết nối..."
                  : "Waiting for connection..."
            }
            disabled={socketStatus !== "connected"}
          />
          <button
            type="button"
            onClick={() => void handleSend()}
            disabled={socketStatus !== "connected"}
            className="rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {locale === "vi" ? "Gửi" : "Send"}
          </button>
        </div>
      </div>
    </section>
  );
}
