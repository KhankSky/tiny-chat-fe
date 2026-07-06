"use client";

import Link from "next/link";
import type { ConversationItem } from "./conversation-sidebar";
import type { Locale } from "@/i18n/types";

export function ConversationListPage({
  locale,
  title,
  description,
  conversations,
}: {
  locale: Locale;
  title: string;
  description: string;
  conversations: ConversationItem[];
}) {
  return (
    <div className="mx-auto grid min-h-screen max-w-7xl gap-6 px-4 py-4 lg:grid-cols-[340px_1fr] lg:px-6">
      <aside className="flex h-full flex-col rounded-[2rem] border border-white/10 bg-slate-950/85">
        <div className="border-b border-white/10 p-5">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">
            Tiny Chat
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-white">{title}</h1>
          <p className="mt-2 text-sm leading-7 text-slate-400">{description}</p>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          <div className="space-y-2">
            {conversations.map((conversation) => (
              <Link
                key={conversation.groupId}
                href={`/${locale}/conversations/${conversation.groupId}`}
                className="block rounded-3xl border border-transparent bg-white/0 p-4 transition hover:border-white/10 hover:bg-white/5"
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
                  <span>#{conversation.groupId}</span>
                  <span>{conversation.updatedAt}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </aside>

      <main className="flex min-h-[calc(100vh-2rem)] flex-col justify-center rounded-[2rem] border border-white/10 bg-slate-950/80 p-8 text-white">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">
          Tiny Chat
        </p>
        <h2 className="mt-4 text-3xl font-semibold">Inbox ready</h2>
        <p className="mt-3 max-w-xl text-sm leading-7 text-slate-300">
          Pick a conversation on the left. This route is the Messenger-style entry
          point before opening the actual thread.
        </p>
        <div className="mt-8">
          <Link
            href={`/${locale}/conversations/1`}
            className="inline-flex items-center justify-center rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
          >
            Open first conversation
          </Link>
        </div>
      </main>
    </div>
  );
}

