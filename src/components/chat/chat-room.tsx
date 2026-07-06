"use client";

import { useEffect, useMemo, useState } from "react";
import { apiGet, apiPost } from "@/lib/api/client";
import { getStoredAuthUser } from "@/lib/auth/session";
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
  const currentUser = useMemo(
    () =>
      getStoredAuthUser() as {
        userId?: number;
        email?: string;
        displayName?: string;
      } | null,
    [],
  );

  useEffect(() => {
    let active = true;

    async function loadHistory() {
      try {
        setLoading(true);
        const history = await apiGet<HistoryResponse>(`/api/groups/${groupId}/messages`);
        if (active) {
          setMessages(history.messages);
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "Failed to load messages");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadHistory();
    const timer = window.setInterval(loadHistory, 3000);

    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [groupId]);

  async function handleSend() {
    const trimmed = content.trim();
    if (!trimmed) return;

    try {
      const newMessage = await apiPost<ChatMessage, { content: string }>(
        `/api/groups/${groupId}/messages`,
        { content: trimmed },
      );
      setMessages((prev) => [...prev, newMessage]);
      setContent("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message");
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
        <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
          {currentUser ? currentUser.email ?? "Logged in" : "Anonymous"}
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
            className="min-h-12 flex-1 rounded-full border border-white/10 bg-white/5 px-5 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/50"
            placeholder={locale === "vi" ? "Nhập tin nhắn..." : "Write a message..."}
          />
          <button
            type="button"
            onClick={() => void handleSend()}
            className="rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
          >
            {locale === "vi" ? "Gửi" : "Send"}
          </button>
        </div>
      </div>
    </section>
  );
}
