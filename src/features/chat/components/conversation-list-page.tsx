"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getConversations } from "@/features/chat/api/chat-api";
import type { ConversationResponse } from "@/features/chat/types";
import { formatDateTime } from "@/i18n/format";
import type { Dictionary, Locale } from "@/i18n/types";

export function ConversationListPage({
  locale,
  dictionary,
}: {
  locale: Locale;
  dictionary: Dictionary;
}) {
  const t = dictionary.chat;
  const [conversations, setConversations] = useState<ConversationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadConversations() {
      try {
        setLoading(true);
        const data = await getConversations();
        if (active) {
          setConversations(data);
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : t.loadConversationsError);
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
  }, [t.loadConversationsError]);

  return (
    <div className="min-h-screen w-full bg-[#070d18] text-white">
      <div className="grid min-h-screen w-full lg:grid-cols-[360px_minmax(0,1fr)_320px]">
        <aside className="flex min-h-screen flex-col border-r border-white/10 bg-[#0b111c]">
          <div className="border-b border-white/10 p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">
              {dictionary.appName}
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-white">
              {t.conversationsTitle}
            </h1>
            <p className="mt-2 text-sm leading-7 text-slate-400">
              {t.conversationsDescription}
            </p>

            <div className="mt-5 rounded-2xl border border-cyan-400/20 bg-cyan-400/5 p-4">
              <p className="text-sm font-semibold text-white">{t.needGroupTitle}</p>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                {t.needGroupDescription}
              </p>
              <Link
                href={`/${locale}/groups/match`}
                className="mt-4 inline-flex rounded-full bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
              >
                {t.findGroup}
              </Link>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3">
            {loading ? (
              <p className="px-3 py-4 text-sm text-slate-400">
                {dictionary.common.loading}
              </p>
            ) : null}

            {error ? (
              <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
              </p>
            ) : null}

            {!loading && !error && conversations.length === 0 ? (
              <p className="px-3 py-4 text-sm leading-7 text-slate-400">
                {t.noConversations}
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
                        {conversation.lastMessage || conversation.description || t.noMessages}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full border border-white/10 px-2 py-1 text-xs text-slate-400">
                      {conversation.memberCount}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                    <span>#{conversation.conversationId}</span>
                    <span>{formatDateTime(conversation.lastMessageAt, locale)}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </aside>

        <main className="flex min-h-screen min-w-0 flex-col justify-between border-x border-white/10 bg-[#0d1322] p-6 text-white sm:p-8">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-300/90">
              {dictionary.appName}
            </p>
            <h2 className="mt-4 text-3xl font-semibold">
              {t.selectConversationTitle}
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-7 text-slate-300">
              {t.selectConversationDescription}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <p className="text-sm font-semibold text-white">{t.layoutTitle}</p>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                {t.layoutDescription}
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <p className="text-sm font-semibold text-white">{t.focusTitle}</p>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                {t.focusDescription}
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-cyan-400/15 bg-cyan-400/5 p-5">
            <p className="text-sm font-semibold text-white">{t.quickTipTitle}</p>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              {t.quickTipDescription}
            </p>
          </div>
        </main>

        <aside className="hidden min-h-screen flex-col border-l border-white/10 bg-[#0b111c] xl:flex">
          <div className="border-b border-white/10 px-5 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-300/90">
              {t.shortcutsEyebrow}
            </p>
            <h3 className="mt-2 text-xl font-semibold text-white">{t.workspaceTitle}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              {t.workspaceDescription}
            </p>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            <Link
              href={`/${locale}/groups/match`}
              className="block rounded-3xl border border-white/10 bg-white/5 p-4 transition hover:border-cyan-400/30 hover:bg-cyan-400/10"
            >
              <p className="text-sm font-semibold text-white">{t.findNewGroup}</p>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                {t.needGroupDescription}
              </p>
            </Link>

            <Link
              href={`/${locale}/profile`}
              className="block rounded-3xl border border-white/10 bg-white/5 p-4 transition hover:border-cyan-400/30 hover:bg-cyan-400/10"
            >
              <p className="text-sm font-semibold text-white">
                {t.completeProfileTitle}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                {t.completeProfileDescription}
              </p>
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
