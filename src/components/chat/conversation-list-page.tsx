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

    void loadConversations();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="min-h-screen w-full bg-[#070d18] text-white">
      <div className="grid min-h-screen w-full lg:grid-cols-[360px_minmax(0,1fr)_320px]">
        <aside className="flex min-h-screen flex-col border-r border-white/10 bg-[#0b111c]">
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
                  className="block rounded-3xl border border-transparent p-4 transition hover:border-white/10 hover:bg-white/5"
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

        <main className="flex min-h-screen min-w-0 flex-col justify-between border-x border-white/10 bg-[#0d1322] p-6 text-white sm:p-8">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-300/90">
              Tiny Chat
            </p>
            <h2 className="mt-4 text-3xl font-semibold">
              {locale === "vi" ? "Chọn một cuộc trò chuyện" : "Select a conversation"}
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-7 text-slate-300">
              {locale === "vi"
                ? "Danh sách bên trái được lấy từ backend theo tài khoản đang đăng nhập. Khi mở một cuộc trò chuyện, phần giữa sẽ thành khung chat chính, còn sidebar phải có thể thu gọn giống Messenger."
                : "The left list is loaded from the backend for the signed-in user. Opening a thread turns the center into the main chat, while the right sidebar can collapse like Messenger."}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <p className="text-sm font-semibold text-white">
                {locale === "vi" ? "Bố cục" : "Layout"}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                {locale === "vi"
                  ? "Sidebar trái, nội dung giữa, sidebar phải."
                  : "Left sidebar, center content, right sidebar."}
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <p className="text-sm font-semibold text-white">
                {locale === "vi" ? "Tập trung" : "Focus"}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                {locale === "vi"
                  ? "Không còn khung giữa bị bó hẹp, giao diện sẽ trải ngang hơn."
                  : "No more narrow centered card; the workspace stretches edge to edge."}
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-cyan-400/15 bg-cyan-400/5 p-5">
            <p className="text-sm font-semibold text-white">
              {locale === "vi" ? "Mẹo nhanh" : "Quick tip"}
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              {locale === "vi"
                ? "Dùng danh sách bên trái để chuyển cuộc hội thoại, rồi thu gọn sidebar phải nếu muốn vùng chat rộng hơn."
                : "Use the left list to switch threads, then collapse the right sidebar when you want more room for chat."}
            </p>
          </div>
        </main>

        <aside className="hidden min-h-screen flex-col border-l border-white/10 bg-[#0b111c] xl:flex">
          <div className="border-b border-white/10 px-5 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-300/90">
              {locale === "vi" ? "Lối tắt" : "Shortcuts"}
            </p>
            <h3 className="mt-2 text-xl font-semibold text-white">
              {locale === "vi" ? "Workspace" : "Workspace"}
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              {locale === "vi"
                ? "Các thao tác thường dùng để chuyển nhanh sang những luồng chính."
                : "Common actions for jumping into the main product flows."}
            </p>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            <Link
              href={`/${locale}/groups/match`}
              className="block rounded-3xl border border-white/10 bg-white/5 p-4 transition hover:border-cyan-400/30 hover:bg-cyan-400/10"
            >
              <p className="text-sm font-semibold text-white">
                {locale === "vi" ? "Tìm nhóm mới" : "Find a new group"}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                {locale === "vi"
                  ? "Ghép nhóm theo level, mục tiêu và sở thích."
                  : "Match by level, goals, and shared interests."}
              </p>
            </Link>

            <Link
              href={`/${locale}/profile`}
              className="block rounded-3xl border border-white/10 bg-white/5 p-4 transition hover:border-cyan-400/30 hover:bg-cyan-400/10"
            >
              <p className="text-sm font-semibold text-white">
                {locale === "vi" ? "Hoàn thiện hồ sơ" : "Complete profile"}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                {locale === "vi"
                  ? "Tối ưu ghép nhóm và trải nghiệm chat."
                  : "Improve matching and chat experience."}
              </p>
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
