"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api/client";
import type { Locale } from "@/i18n/types";

type ConversationResponse = {
  conversationId: number;
  groupId: number;
  title: string;
  description: string | null;
  lastMessage: string | null;
  lastMessageAt: string | null;
  memberCount: number;
};

export function ConversationListPage({
  locale,
  title,
  description,
}: {
  locale: Locale;
  title: string;
  description: string;
}) {
  const [conversations, setConversations] = useState<ConversationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadConversations() {
      try {
        setLoading(true);
        const data = await apiGet<ConversationResponse[]>("/api/conversations");
        if (active) {
          setConversations(data);
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "Could not load conversations");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadConversations();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="mx-auto grid min-h-screen max-w-7xl gap-6 px-4 py-4 lg:grid-cols-[360px_1fr] lg:px-6">
      <aside className="flex h-full flex-col rounded-lg border border-white/10 bg-slate-950/85">
        <div className="border-b border-white/10 p-5">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">
            Tiny Chat
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-white">{title}</h1>
          <p className="mt-2 text-sm leading-7 text-slate-400">{description}</p>

          <div className="mt-5 rounded-2xl border border-cyan-400/20 bg-cyan-400/5 p-4">
            <p className="text-sm font-semibold text-white">
              {locale === "vi" ? "Cần một nhóm mới?" : "Need a new group?"}
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              {locale === "vi"
                ? "Ghép nhóm theo level, mục tiêu và sở thích chỉ với một nút bấm."
                : "Match by level, goal, and interests with a single tap."}
            </p>
            <Link
              href={`/${locale}/groups/match`}
              className="mt-4 inline-flex rounded-full bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
            >
              {locale === "vi" ? "Tìm nhóm" : "Find a group"}
            </Link>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          {loading ? (
            <p className="px-3 py-4 text-sm text-slate-400">
              {locale === "vi" ? "Đang tải..." : "Loading..."}
            </p>
          ) : null}

          {error ? (
            <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </p>
          ) : null}

          {!loading && !error && conversations.length === 0 ? (
            <p className="px-3 py-4 text-sm leading-7 text-slate-400">
              {locale === "vi"
                ? "Bạn chưa có cuộc trò chuyện nào."
                : "You do not have any conversations yet."}
            </p>
          ) : null}

          <div className="space-y-2">
            {conversations.map((conversation) => (
              <Link
                key={conversation.conversationId}
                href={`/${locale}/conversations/${conversation.conversationId}`}
                className="block rounded-lg border border-transparent p-4 transition hover:border-white/10 hover:bg-white/5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">
                      {conversation.title}
                    </p>
                    <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-400">
                      {conversation.lastMessage ||
                        conversation.description ||
                        (locale === "vi" ? "Chưa có tin nhắn." : "No messages yet.")}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full border border-white/10 px-2 py-1 text-xs text-slate-400">
                    {conversation.memberCount}
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                  <span>#{conversation.conversationId}</span>
                  <span>
                    {conversation.lastMessageAt
                      ? new Date(conversation.lastMessageAt).toLocaleString()
                      : ""}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </aside>

      <main className="flex min-h-[calc(100vh-2rem)] flex-col justify-center rounded-lg border border-white/10 bg-slate-950/80 p-8 text-white">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">
          Tiny Chat
        </p>
        <h2 className="mt-4 text-3xl font-semibold">
          {locale === "vi" ? "Chọn một cuộc trò chuyện" : "Select a conversation"}
        </h2>
        <p className="mt-3 max-w-xl text-sm leading-7 text-slate-300">
          {locale === "vi"
            ? "Danh sách bên trái được lấy từ backend theo tài khoản đang đăng nhập."
            : "The list on the left is loaded from the backend for the signed-in user."}
        </p>
      </main>
    </div>
  );
}
