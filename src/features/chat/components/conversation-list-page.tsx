"use client";

import Link from "next/link";
import { useConversations } from "@/features/chat/hooks/use-conversations";
import { ProfileEditorModal } from "@/features/profile/components/profile-editor-modal";
import { useProfileEditor } from "@/features/profile/hooks/use-profile-editor";
import type { Dictionary, Locale } from "@/i18n/types";
import type { ThemeMode } from "@/theme/use-theme-preference";
import { ErrorMessage } from "@/shared/ui/error-message";
import { LoadingState } from "@/shared/ui/loading-state";
import { ConversationSidebar } from "./conversation-sidebar";

export function ConversationListPage({
  dictionary,
  locale,
  onLocaleChange,
  onThemeChange,
  theme,
}: {
  dictionary: Dictionary;
  locale: Locale;
  onLocaleChange?: (locale: Locale) => void;
  theme?: ThemeMode;
  onThemeChange?: (theme: ThemeMode) => void;
}) {
  const t = dictionary.chat;
  const conversations = useConversations({ dictionary, locale });
  const profileEditor = useProfileEditor(dictionary);

  return (
    <div className="h-screen w-full overflow-hidden bg-[#070d18] text-white">
      <div className="grid h-full min-h-0 w-full lg:grid-cols-[340px_minmax(0,1fr)_360px]">
        <ConversationSidebar
          locale={locale}
          dictionary={dictionary}
          conversations={conversations}
          activeGroupId={-1}
          currentUser={profileEditor.currentUser}
          onEditProfile={profileEditor.openProfileEditor}
        />

        <main className="flex min-h-0 min-w-0 flex-col overflow-hidden border-r border-white/10 bg-[#0d1322]">
          <header className="flex shrink-0 items-center justify-between border-b border-white/10 px-5 py-4 sm:px-6">
            <h2 className="truncate text-xl font-semibold text-white">
              {t.selectConversationTitle}
            </h2>
            <Link
              href="/groups/match"
              className="inline-flex h-9 shrink-0 items-center rounded-full bg-cyan-400 px-4 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
            >
              {t.findGroup}
            </Link>
          </header>

          <div className="flex min-h-0 flex-1 items-center justify-center bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.08),transparent_32%),linear-gradient(180deg,rgba(2,6,23,0.16),rgba(2,6,23,0.35))] px-6">
            <div className="max-w-md text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl border border-cyan-400/20 bg-cyan-400/10 text-2xl font-semibold text-cyan-200">
                TC
              </div>
              <h1 className="mt-5 text-2xl font-semibold text-white">
                {t.selectConversationTitle}
              </h1>
              <p className="mt-3 text-sm leading-7 text-slate-400">
                {t.conversationsDescription}
              </p>
              <p className="mt-2 text-sm leading-7 text-slate-500">
                {t.quickTipDescription}
              </p>
            </div>
          </div>
        </main>

        <aside className="hidden h-full min-h-0 flex-col overflow-hidden border-l border-white/10 bg-[#0b111c] lg:flex">
          <div className="border-b border-white/10 px-5 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-300/90">
              {t.workspaceTitle}
            </p>
            <h3 className="mt-2 text-xl font-semibold text-white">{t.needGroupTitle}</h3>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-4">
            <Link
              href="/groups/match"
              className="block rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.06] p-4 transition hover:border-cyan-300/40 hover:bg-cyan-400/10"
            >
              <p className="text-sm font-semibold text-white">{t.findNewGroup}</p>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                {t.needGroupDescription}
              </p>
            </Link>

            {conversations.length === 0 ? (
              <p className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm leading-6 text-slate-400">
                {t.noConversations}
              </p>
            ) : null}

            {profileEditor.profileLoading ? (
              <LoadingState className="mt-5" label={dictionary.common.loading} />
            ) : null}

            {profileEditor.profileError ? (
              <ErrorMessage className="mt-5">{profileEditor.profileError}</ErrorMessage>
            ) : null}
          </div>
        </aside>
      </div>

      <ProfileEditorModal
        dictionary={dictionary}
        editor={profileEditor}
        locale={locale}
        onLocaleChange={onLocaleChange}
        theme={theme}
        onThemeChange={onThemeChange}
      />
    </div>
  );
}
