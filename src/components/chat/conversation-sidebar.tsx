"use client";

import Link from "next/link";
import type { Locale } from "@/i18n/types";

export type ConversationItem = {
  conversationId?: number;
  groupId: number;
  title: string;
  preview: string;
  updatedAt: string;
  unreadCount?: number;
};

export function ConversationSidebar({
  locale,
  appName,
  conversations,
  activeGroupId,
}: {
  locale: Locale;
  appName: string;
  conversations: ConversationItem[];
  activeGroupId: number;
}) {
  return (
    <aside className="flex h-full flex-col rounded-[2rem] border border-white/10 bg-slate-950/85">
      <div className="border-b border-white/10 p-5">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">
          {appName}
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-white">
          {locale === "vi" ? "Cuộc hội thoại" : "Conversations"}
        </h1>
        <p className="mt-2 text-sm leading-7 text-slate-400">
          {locale === "vi"
            ? "Chọn một nhóm để mở khung chat."
            : "Pick a group to open the chat pane."}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        <div className="space-y-2">
          {conversations.map((conversation) => {
            const active = conversation.groupId === activeGroupId;
            const conversationId = conversation.conversationId ?? conversation.groupId;
            return (
              <Link
                key={conversationId}
                href={`/${locale}/conversations/${conversationId}`}
                className={`block rounded-3xl border p-4 transition ${
                  active
                    ? "border-cyan-400/40 bg-cyan-400/10"
                    : "border-transparent bg-white/0 hover:border-white/10 hover:bg-white/5"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">
                      {conversation.title}
                    </p>
                    <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-400">
                      {conversation.preview}
                    </p>
                  </div>
                  {conversation.unreadCount ? (
                    <span className="rounded-full bg-cyan-400 px-2.5 py-1 text-xs font-semibold text-slate-950">
                      {conversation.unreadCount}
                    </span>
                  ) : null}
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                  <span>Group #{conversation.groupId}</span>
                  <span>{conversation.updatedAt}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
