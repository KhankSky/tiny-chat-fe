"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { AuthUserResponse } from "@/features/auth/types";
import { getMyStreak } from "@/features/chat/api/chat-api";
import { PERSONAL_STREAK_CHANGED_EVENT } from "@/features/chat/hooks/use-chat-room";
import type { UserStreakResponse } from "@/features/chat/types";
import { FriendsPanel } from "@/features/friends/components/friends-panel";
import type { Dictionary, Locale } from "@/i18n/types";
import { Avatar } from "@/shared/ui/avatar";

export type ConversationItem = {
  conversationId?: number;
  groupId: number;
  title: string;
  avatarUrl?: string | null;
  preview: string;
  updatedAt: string;
  unreadCount?: number;
};

function PersonalStreakBadge({
  days,
  label,
}: {
  days: number;
  label: string;
}) {
  return (
    <span
      className="relative flex shrink-0 items-center gap-1.5 overflow-hidden rounded-full bg-[radial-gradient(circle_at_25%_0%,rgba(251,191,36,0.25),transparent_42%),rgba(251,191,36,0.08)] px-2 py-1 text-xs font-bold text-amber-50 shadow-[0_0_22px_rgba(251,146,60,0.18)]"
      title={label}
    >
      <span className="absolute inset-0 animate-streak-shimmer bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.18),transparent)]" />
      <span className="relative flex h-5 w-5 items-center justify-center rounded-full bg-amber-300/10">
        <span className="absolute inset-0 animate-streak-glow rounded-full bg-amber-300/20 blur-sm" />
        <span className="streak-flame streak-flame-sm relative" aria-hidden="true" />
      </span>
      <span className="relative leading-none">{days}</span>
    </span>
  );
}

export function ConversationSidebar({
  locale,
  dictionary,
  conversations,
  activeGroupId,
  currentUser,
  onEditProfile,
}: {
  locale: Locale;
  dictionary: Dictionary;
  conversations: ConversationItem[];
  activeGroupId: number;
  currentUser?: AuthUserResponse | null;
  onEditProfile?: () => void;
}) {
  const t = dictionary.chat;
  const [userStreak, setUserStreak] = useState<UserStreakResponse | null>(null);

  useEffect(() => {
    let active = true;

    async function loadUserStreak() {
      try {
        const streak = await getMyStreak();
        if (active) {
          setUserStreak(streak);
        }
      } catch {
        if (active) {
          setUserStreak(null);
        }
      }
    }

    if (currentUser) {
      void loadUserStreak();
    }

    function handlePersonalStreakChanged(event: Event) {
      const nextStreak = (event as CustomEvent<UserStreakResponse>).detail;
      if (nextStreak?.userId === currentUser?.userId) {
        setUserStreak(nextStreak);
      }
    }

    window.addEventListener(PERSONAL_STREAK_CHANGED_EVENT, handlePersonalStreakChanged);

    return () => {
      active = false;
      window.removeEventListener(PERSONAL_STREAK_CHANGED_EVENT, handlePersonalStreakChanged);
    };
  }, [currentUser]);

  return (
    <aside className="flex h-full min-h-0 flex-col overflow-hidden border-r border-white/10 bg-[#0b111c]">
      <div className="border-b border-white/10 px-5 py-4">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-300/90">
              {dictionary.appName}
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-white">{t.sidebarTitle}</h1>
          </div>
          <Link
            href="/groups/match"
            className="inline-flex h-10 shrink-0 items-center rounded-full bg-cyan-400 px-4 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
          >
            {t.findGroup}
          </Link>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-2 py-2">
        <div className="space-y-1">
          {conversations.map((conversation) => {
            const active = conversation.groupId === activeGroupId;
            const conversationId = conversation.conversationId ?? conversation.groupId;
            return (
              <Link
                key={conversationId}
                href={`/conversations/${conversationId}`}
                className={`flex items-center gap-3 rounded-2xl border px-3 py-3 transition ${
                  active
                    ? "border-cyan-400/40 bg-cyan-400/10 shadow-[0_0_0_1px_rgba(34,211,238,0.08)]"
                    : "border-transparent bg-white/0 hover:border-white/10 hover:bg-white/5"
                }`}
              >
                <Avatar
                  className="h-12 w-12 ring-1 ring-white/10"
                  src={conversation.avatarUrl}
                  alt={conversation.title}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="min-w-0 flex-1 truncate text-sm font-semibold text-white">
                      {conversation.title}
                    </p>
                    <span className="shrink-0 text-[11px] font-medium text-slate-500">
                      {conversation.updatedAt}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-sm leading-5 text-slate-400">
                    {conversation.preview}
                  </p>
                </div>
                {conversation.unreadCount ? (
                  <span className="shrink-0 rounded-full bg-cyan-400 px-2 py-0.5 text-xs font-semibold text-slate-950">
                    {conversation.unreadCount}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </div>
        <FriendsPanel dictionary={dictionary} locale={locale} />
      </div>

      <div className="shrink-0 border-t border-white/10 px-3 py-3">
        <button
          type="button"
          onClick={onEditProfile}
          className="flex w-full items-center gap-3 rounded-[1.25rem] border border-white/10 bg-white/5 px-3 py-3 text-left transition hover:border-cyan-400/30 hover:bg-cyan-400/10"
        >
          <Avatar
            src={currentUser?.avatarUrl}
            alt={currentUser?.displayName || currentUser?.email || "User avatar"}
          />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold text-white">
              {currentUser?.displayName || currentUser?.email || dictionary.common.you}
            </span>
            <span className="mt-1 block truncate text-xs text-slate-400">
              {currentUser?.email || t.personalInfo}
            </span>
          </span>
          {userStreak ? (
            <PersonalStreakBadge
              days={userStreak.currentStreak}
              label={`${t.personalStreak}: ${userStreak.currentStreak} ${t.streakDays}`}
            />
          ) : null}
        </button>
      </div>
    </aside>
  );
}
