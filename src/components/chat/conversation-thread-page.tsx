"use client";

import { ChatRoom } from "./chat-room";
import type { Locale } from "@/i18n/types";

export function ConversationThreadPage({
  locale,
  conversationId,
}: {
  locale: Locale;
  conversationId: number;
}) {
  return (
    <div className="mx-auto grid min-h-screen max-w-7xl gap-6 px-4 py-4 lg:grid-cols-[340px_1fr] lg:px-6">
      <aside className="flex h-full flex-col rounded-[2rem] border border-white/10 bg-slate-950/85 p-5 text-white">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">
          Tiny Chat
        </p>
        <h1 className="mt-2 text-2xl font-semibold">
          {locale === "vi" ? "Cuộc hội thoại" : "Conversations"}
        </h1>
        <p className="mt-2 text-sm leading-7 text-slate-400">
          {locale === "vi"
            ? "Danh sách phòng sẽ nằm ở đây."
            : "Your conversation list can live here."}
        </p>
      </aside>

      <ChatRoom locale={locale} groupId={conversationId} />
    </div>
  );
}
