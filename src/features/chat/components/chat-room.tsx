"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { AuthUserResponse } from "@/features/auth/types";
import { getGroupMessages, sendGroupMessage } from "@/features/chat/api/chat-api";
import type { ChatMessage } from "@/features/chat/types";
import { formatDateTime } from "@/i18n/format";
import type { Dictionary, Locale } from "@/i18n/types";
import { getAccessToken } from "@/shared/auth/session";
import { logClientError } from "@/shared/lib/logger";
import { StompClient } from "@/shared/realtime/stomp";

type LocalChatMessage = ChatMessage & {
  clientTempId?: string;
};

type SocketStatus = "idle" | "connecting" | "connected" | "error";

function parseChatMessage(payload: string) {
  return JSON.parse(payload) as ChatMessage;
}

function createOptimisticMessage(
  content: string,
  currentUser: { userId?: number; displayName?: string | null; email?: string | null } | null,
  groupId: number,
  fallbackSenderName: string,
) {
  return {
    messageId: -Date.now(),
    clientTempId: `temp-${Date.now()}`,
    groupId,
    senderId: currentUser?.userId ?? -1,
    senderName: currentUser?.displayName ?? currentUser?.email ?? fallbackSenderName,
    senderAvatarUrl: null,
    content,
    sentAt: new Date().toISOString(),
  } satisfies LocalChatMessage;
}

export function ChatRoom({
  locale,
  dictionary,
  groupId,
  currentUser = null,
  sidebarOpen,
  onToggleSidebar,
}: {
  locale: Locale;
  dictionary: Dictionary;
  groupId: number;
  currentUser?: AuthUserResponse | null;
  sidebarOpen?: boolean;
  onToggleSidebar?: () => void;
}) {
  const t = dictionary.chat;
  const [messages, setMessages] = useState<LocalChatMessage[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [socketStatus, setSocketStatus] = useState<SocketStatus>("idle");
  const [socketError, setSocketError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const stompClientRef = useRef<StompClient | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const accessToken = useMemo(() => getAccessToken(), []);

  useEffect(() => {
    let active = true;
    const client = accessToken ? new StompClient(accessToken) : null;
    stompClientRef.current = client;

    async function loadHistoryAndConnect() {
      try {
        setLoading(true);
        setError(null);
        const history = await getGroupMessages(groupId);
        if (active) {
          setMessages(history.messages);
        }

        if (!client) {
          if (active) {
            setSocketStatus("error");
            setSocketError(t.realtimeSignInRequired);
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
        unsubscribeRef.current = client.subscribe(`/topic/groups/${groupId}/messages`, (body) => {
          if (!active) return;
          try {
            const nextMessage = parseChatMessage(body);
            setMessages((prev) => {
              if (prev.some((message) => message.messageId === nextMessage.messageId)) {
                return prev;
              }

              if (
                prev.some(
                  (message) =>
                    message.senderId === nextMessage.senderId &&
                    message.content === nextMessage.content &&
                    message.messageId < 0 &&
                    Math.abs(
                      new Date(message.sentAt).getTime() - new Date(nextMessage.sentAt).getTime(),
                    ) < 15_000,
                )
              ) {
                return prev.map((message) =>
                  message.messageId < 0 &&
                  message.senderId === nextMessage.senderId &&
                  message.content === nextMessage.content
                    ? nextMessage
                    : message,
                );
              }

              return [...prev, nextMessage];
            });
          } catch (messageError) {
            logClientError("Received invalid chat data", {
              groupId,
              error: messageError instanceof Error ? messageError.message : t.unknownSocketError,
            });
            setSocketError(t.invalidChatData);
          }
        });
      } catch (err) {
        if (active) {
          const message = err instanceof Error ? err.message : t.loadMessagesError;
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
  }, [
    accessToken,
    groupId,
    t.invalidChatData,
    t.loadMessagesError,
    t.realtimeSignInRequired,
    t.unknownSocketError,
  ]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  async function handleSend() {
    const trimmed = content.trim();
    if (!trimmed) return;

    const optimisticMessage = createOptimisticMessage(
      trimmed,
      currentUser,
      groupId,
      dictionary.common.you,
    );
    setMessages((prev) => [...prev, optimisticMessage]);
    setContent("");

    try {
      if (stompClientRef.current && socketStatus === "connected") {
        stompClientRef.current.send(`/app/groups/${groupId}/messages`, {
          content: trimmed,
        });
      } else {
        const newMessage = await sendGroupMessage(groupId, trimmed);
        setMessages((prev) =>
          prev.map((message) =>
            message.messageId === optimisticMessage.messageId ? newMessage : message,
          ),
        );
      }
    } catch (err) {
      setMessages((prev) =>
        prev.filter((message) => message.messageId !== optimisticMessage.messageId),
      );
      setContent(trimmed);
      setSocketError(err instanceof Error ? err.message : t.sendMessageError);
    }
  }

  return (
    <section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-[#0d1322]">
      <header className="flex shrink-0 items-center justify-between border-b border-white/10 px-5 py-4 sm:px-6">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-300/90">
            {t.roomEyebrow}
          </p>
          <h2 className="mt-2 truncate text-xl font-semibold text-white">Group #{groupId}</h2>
        </div>
        <div className="flex items-center gap-2">
          {onToggleSidebar ? (
            <button
              type="button"
              onClick={onToggleSidebar}
              aria-label={
                sidebarOpen ? t.toggleSidebar.collapse : t.toggleSidebar.open
              }
              className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-sm font-semibold text-white transition hover:border-cyan-400/40 hover:bg-cyan-400/10"
            >
              {sidebarOpen ? ">" : "<"}
            </button>
          ) : null}
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
            {t.socketStatus[socketStatus]}
          </span>
          <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
            {currentUser ? currentUser.email ?? dictionary.common.loggedIn : dictionary.common.anonymous}
          </div>
        </div>
      </header>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.08),transparent_32%),linear-gradient(180deg,rgba(2,6,23,0.16),rgba(2,6,23,0.35))] px-4 py-5 sm:px-6">
        {loading ? (
          <p className="text-sm text-slate-400">{dictionary.common.loading}</p>
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
            <div key={message.messageId} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[75%] rounded-3xl px-4 py-3 text-sm leading-7 ${
                  isMine
                    ? "bg-cyan-400 text-slate-950"
                    : "border border-white/10 bg-white/5 text-white"
                }`}
              >
                <div className="mb-1 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.25em] opacity-70">
                  <span>{message.senderName}</span>
                  <span>-</span>
                  <span>{formatDateTime(message.sentAt, locale)}</span>
                </div>
                <p>{message.content}</p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div className="shrink-0 border-t border-white/10 bg-[#0b111c] p-4">
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
            placeholder={socketStatus === "connected" ? t.writeMessage : t.waitingForConnection}
            disabled={false}
          />
          <button
            type="button"
            onClick={() => void handleSend()}
            className="rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {t.send}
          </button>
        </div>
      </div>
    </section>
  );
}
