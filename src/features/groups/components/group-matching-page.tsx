"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { matchGroup } from "@/features/groups/api/groups-api";
import type { AuthUserResponse } from "@/features/auth/types";
import type { MatchGroupResponse } from "@/features/groups/types";
import { getStoredAuthUser } from "@/shared/auth/session";
import type { Locale } from "@/i18n/types";

type CurrentUser = Pick<
  AuthUserResponse,
  "displayName" | "englishLevel" | "practiceGoal" | "interests" | "profileCompleted" | "email"
>;

const englishLevelLabel: Record<string, string> = {
  LEVEL_A: "Beginner",
  LEVEL_B: "Intermediate",
  LEVEL_C: "Advanced",
};

const practiceGoalLabel: Record<string, string> = {
  DAILY_CHAT: "Daily chat",
  IMPROVE_WRITING: "Improve writing",
  MAKE_FRIENDS: "Make friends",
  TOEIC_BASIC: "TOEIC basic",
  IELTS_BASIC: "IELTS basic",
};

const interestLabel: Record<string, string> = {
  FOOD: "Food",
  TRAVEL: "Travel",
  STUDY: "Study",
  WORK: "Work",
  MUSIC: "Music",
  MOVIES: "Movies",
  DAILY_LIFE: "Daily life",
  SPORT: "Sport",
  TECHNOLOGY: "Technology",
  BOOKS: "Books",
  GAMES: "Games",
};

const copy = {
  en: {
    eyebrow: "Group matching",
    title: "Find a small group that feels easy to join.",
    description:
      "We match by level first, then try to keep the group useful with shared goals and overlapping interests. Groups can start before they are full, and they stay capped at five people.",
    primary: "Find a group",
    secondary: "Back to conversations",
    profileReady: "Profile ready",
    profileMissing: "Complete your profile first",
    profileHint:
      "A filled-in profile gives the matcher stronger signals, especially for level, goal, and shared interests.",
    statusIdle: "Ready when you are",
    statusLoading: "Looking for the best fit",
    loadingHint:
      "We are checking level, room for one more person, and whether there is a useful overlap.",
    successTitle: "You are in",
    openChat: "Open chat",
    searchAgain: "Match again",
    newGroup: "New group created",
    joinedGroup: "Joined an existing group",
    sizeLabel: "Group size",
    levelLabel: "Target level",
    goalLabel: "Matched goal",
    interestsLabel: "Shared interests",
    reasonLabel: "Why this match",
    joinedAtLabel: "Joined at",
    bestPracticeTitle: "Matching rules we follow",
    rules: [
      "Up to five members per group.",
      "Three to five people is the sweet spot for active conversation.",
      "People with the same or nearby English level are prioritized.",
      "Similar goals and interests help the room feel more natural.",
      "The MVP keeps users in only a small number of active groups.",
    ],
    supportTitle: "What happens next",
    supportText:
      "If we find a group with an open slot, you join it immediately. If not, we create a new group so you do not wait around for the room to fill up.",
  },
  vi: {
    eyebrow: "Ghép nhóm",
    title: "Tìm một nhóm nhỏ để vào cuộc trò chuyện dễ hơn.",
    description:
      "Hệ thống ưu tiên ghép theo trình độ trước, sau đó tối ưu theo mục tiêu và sở thích chung. Nhóm có thể hoạt động ngay khi chưa đủ 5 người và luôn bị giới hạn ở 5 thành viên.",
    primary: "Tìm nhóm",
    secondary: "Về danh sách chat",
    profileReady: "Hồ sơ đã sẵn sàng",
    profileMissing: "Hoàn thiện hồ sơ trước",
    profileHint:
      "Hồ sơ đầy đủ giúp hệ thống ghép chính xác hơn, nhất là ở trình độ, mục tiêu và sở thích.",
    statusIdle: "Sẵn sàng khi bạn muốn",
    statusLoading: "Đang tìm nhóm phù hợp nhất",
    loadingHint:
      "Mình đang kiểm tra trình độ, chỗ trống còn lại và độ khớp về mục tiêu/sở thích.",
    successTitle: "Bạn đã vào nhóm",
    openChat: "Mở chat",
    searchAgain: "Tìm lại nhóm",
    newGroup: "Đã tạo nhóm mới",
    joinedGroup: "Đã vào nhóm hiện có",
    sizeLabel: "Số người trong nhóm",
    levelLabel: "Trình độ mục tiêu",
    goalLabel: "Mục tiêu khớp",
    interestsLabel: "Sở thích chung",
    reasonLabel: "Lý do ghép",
    joinedAtLabel: "Thời điểm tham gia",
    bestPracticeTitle: "Quy tắc ghép nhóm",
    rules: [
      "Mỗi nhóm tối đa 5 người.",
      "Từ 3 đến 5 người là mức phù hợp nhất cho thảo luận.",
      "Ưu tiên người cùng hoặc gần trình độ tiếng Anh.",
      "Mục tiêu và sở thích gần nhau giúp cuộc trò chuyện tự nhiên hơn.",
      "Ở MVP, mỗi user chỉ nên ở một số nhóm nhỏ và có chủ đích.",
    ],
    supportTitle: "Sau khi bấm tìm nhóm",
    supportText:
      "Nếu có nhóm còn chỗ trống, bạn sẽ vào ngay nhóm đó. Nếu chưa có nhóm phù hợp, hệ thống sẽ tạo nhóm mới để bạn không phải chờ.",
  },
} as const;

function formatLabel(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  return (
    englishLevelLabel[value] ||
    practiceGoalLabel[value] ||
    interestLabel[value] ||
    value
      .split("_")
      .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
      .join(" ")
  );
}

function formatJoinedAt(joinedAt: string | null, locale: Locale) {
  if (!joinedAt) return null;
  return new Intl.DateTimeFormat(locale === "vi" ? "vi-VN" : "en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(joinedAt));
}

export function GroupMatchingPage({ locale }: { locale: Locale }) {
  const router = useRouter();
  const [matchResult, setMatchResult] = useState<MatchGroupResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentUser = useMemo(() => {
    const stored = getStoredAuthUser() as CurrentUser | null;
    return stored;
  }, []);

  const messages = copy[locale];

  async function handleFindGroup() {
    setError(null);
    setLoading(true);

    try {
      const result = await matchGroup();
      setMatchResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to match group");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.18),_transparent_36%),linear-gradient(180deg,_#020617_0%,_#020617_100%)] text-white">
      <div className="mx-auto max-w-7xl px-4 py-6 lg:px-6 lg:py-8">
        <div className="mb-6 flex flex-col gap-4 rounded-[2rem] border border-white/10 bg-white/5 p-5 backdrop-blur lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-300">
              Tiny Chat
            </p>
            <h1 className="mt-2 text-2xl font-semibold">{messages.eyebrow}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-300">
              {messages.description}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href={`/${locale}/conversations`}
              className="rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-white transition hover:border-white/30 hover:bg-white/5"
            >
              {messages.secondary}
            </Link>
            <button
              type="button"
              onClick={() => void handleFindGroup()}
              disabled={loading}
              className="rounded-full bg-cyan-400 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? messages.statusLoading : messages.primary}
            </button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="space-y-6">
            <div className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 shadow-2xl shadow-cyan-950/20">
              <div className="grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
                <div className="space-y-4">
                  <div className="inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-200">
                    {messages.statusIdle}
                  </div>
                  <h2 className="text-3xl font-semibold leading-tight">
                    {messages.title}
                  </h2>
                  <p className="max-w-2xl text-sm leading-7 text-slate-300">
                    {messages.supportText}
                  </p>
                </div>

                <div className="space-y-3 rounded-3xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                        {currentUser?.profileCompleted ? messages.profileReady : messages.profileMissing}
                      </p>
                      <p className="mt-2 text-sm font-semibold text-white">
                        {currentUser?.displayName ||
                          currentUser?.email ||
                          (locale === "vi" ? "Chưa có hồ sơ" : "No profile yet")}
                      </p>
                    </div>
                    <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-300">
                      MVP
                    </span>
                  </div>
                  <p className="text-sm leading-7 text-slate-300">
                    {messages.profileHint}
                  </p>
                  {!currentUser?.profileCompleted ? (
                    <Link
                      href={`/${locale}/auth/complete-profile`}
                      className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:border-cyan-400/30 hover:bg-cyan-400/15"
                    >
                      {locale === "vi"
                        ? "Hoàn thiện hồ sơ ngay"
                        : "Complete profile now"}
                    </Link>
                  ) : null}
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-200">
                      {currentUser?.englishLevel
                        ? formatLabel(currentUser.englishLevel)
                        : locale === "vi"
                          ? "Trình độ chưa có"
                          : "Level unknown"}
                    </span>
                    <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-200">
                      {currentUser?.practiceGoal
                        ? formatLabel(currentUser.practiceGoal)
                        : locale === "vi"
                          ? "Mục tiêu chưa có"
                          : "Goal unknown"}
                    </span>
                    <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-200">
                      {currentUser?.interests?.length
                        ? `${currentUser.interests.length} ${locale === "vi" ? "sở thích" : "interests"}`
                        : locale === "vi"
                          ? "Chưa có sở thích"
                          : "No interests yet"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <article className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
                <p className="text-sm font-semibold text-white">{messages.bestPracticeTitle}</p>
                <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-300">
                  {messages.rules.map((rule) => (
                    <li key={rule} className="flex gap-3">
                      <span className="mt-2 h-2 w-2 rounded-full bg-cyan-300" />
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </article>

              <article className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
                <p className="text-sm font-semibold text-white">{locale === "vi" ? "Tín hiệu dùng để ghép" : "Signals used for matching"}</p>
                <div className="mt-4 grid gap-3">
                  {[
                    locale === "vi" ? "Cùng hoặc gần level" : "Same or nearby level",
                    locale === "vi" ? "Sở thích giao nhau" : "Overlapping interests",
                    locale === "vi" ? "Mục tiêu học tập giống nhau" : "Shared learning goals",
                    locale === "vi" ? "Chừa slot cho nhóm tối đa 5 người" : "Capacity for up to five",
                  ].map((item) => (
                    <div
                      key={item}
                      className="rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-slate-200"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </article>
            </div>
          </section>

          <section
            className="space-y-4 rounded-[2rem] border border-white/10 bg-slate-950/85 p-6"
            aria-live="polite"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">
                  {messages.statusIdle}
                </p>
                <h2 className="mt-2 text-2xl font-semibold">
                  {matchResult ? messages.successTitle : messages.primary}
                </h2>
              </div>
              {matchResult ? (
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                    matchResult.createdNewGroup
                      ? "border-cyan-400/30 bg-cyan-400/10 text-cyan-200"
                      : "border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
                  }`}
                >
                  {matchResult.createdNewGroup ? messages.newGroup : messages.joinedGroup}
                </span>
              ) : null}
            </div>

            {!matchResult ? (
              <div className="space-y-4">
                <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
                  <p className="text-sm leading-7 text-slate-300">{messages.loadingHint}</p>
                </div>

                <button
                  type="button"
                  onClick={() => void handleFindGroup()}
                  disabled={loading}
                  className="inline-flex w-full items-center justify-center rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-70"
                  aria-busy={loading}
                >
                  {loading ? messages.statusLoading : messages.primary}
                </button>

                {loading ? (
                  <div className="space-y-3 rounded-[1.5rem] border border-cyan-400/20 bg-cyan-400/5 p-5">
                    <div className="h-3 w-3/4 animate-pulse rounded-full bg-cyan-300/40" />
                    <div className="h-3 w-1/2 animate-pulse rounded-full bg-cyan-300/25" />
                    <div className="h-3 w-5/6 animate-pulse rounded-full bg-cyan-300/15" />
                  </div>
                ) : null}

                {error ? (
                  <div
                    className="rounded-[1.5rem] border border-red-500/30 bg-red-500/10 p-5 text-sm text-red-100"
                    role="alert"
                  >
                    <p className="font-semibold">
                      {locale === "vi" ? "Không thể ghép nhóm" : "Could not match you"}
                    </p>
                    <p className="mt-2 leading-7">{error}</p>
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm text-slate-400">
                        {matchResult.groupName || (locale === "vi" ? "Nhóm của bạn" : "Your group")}
                      </p>
                      <h3 className="mt-1 text-2xl font-semibold text-white">
                        #{matchResult.groupId}
                      </h3>
                    </div>
                    <div className="text-right">
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                        {messages.sizeLabel}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-white">
                        {matchResult.memberCount ?? 0}
                        {matchResult.maxMembers ? ` / ${matchResult.maxMembers}` : ""}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {matchResult.targetLevel ? (
                      <span className="rounded-full border border-white/10 bg-slate-950/80 px-3 py-1 text-xs text-slate-200">
                        {messages.levelLabel}: {formatLabel(matchResult.targetLevel)}
                      </span>
                    ) : null}
                    {matchResult.matchedGoal ? (
                      <span className="rounded-full border border-white/10 bg-slate-950/80 px-3 py-1 text-xs text-slate-200">
                        {messages.goalLabel}: {formatLabel(matchResult.matchedGoal)}
                      </span>
                    ) : null}
                    {matchResult.sharedInterests?.length ? (
                      <span className="rounded-full border border-white/10 bg-slate-950/80 px-3 py-1 text-xs text-slate-200">
                        {messages.interestsLabel}: {matchResult.sharedInterests.length}
                      </span>
                    ) : null}
                  </div>

                  {matchResult.groupDescription ? (
                    <p className="mt-4 text-sm leading-7 text-slate-300">
                      {matchResult.groupDescription}
                    </p>
                  ) : null}

                  {matchResult.matchedReason ? (
                    <div className="mt-4 rounded-2xl border border-cyan-400/20 bg-cyan-400/5 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">
                        {messages.reasonLabel}
                      </p>
                      <p className="mt-2 text-sm leading-7 text-slate-200">
                        {matchResult.matchedReason}
                      </p>
                    </div>
                  ) : null}
                </div>

                {matchResult.sharedInterests?.length ? (
                  <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
                    <p className="text-sm font-semibold text-white">{messages.interestsLabel}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {matchResult.sharedInterests.map((interest) => (
                        <span
                          key={interest}
                          className="rounded-full border border-white/10 bg-slate-950/80 px-3 py-1 text-xs text-slate-200"
                        >
                          {formatLabel(interest)}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}

                <div className="grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => router.push(`/${locale}/conversations/${matchResult.groupId}`)}
                    className="rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
                  >
                    {messages.openChat}
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleFindGroup()}
                    disabled={loading}
                    className="rounded-full border border-white/15 px-5 py-3 text-sm font-medium text-white transition hover:border-white/30 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {messages.searchAgain}
                  </button>
                </div>

                {matchResult.joinedAt ? (
                  <p className="text-xs text-slate-500">
                    {messages.joinedAtLabel}: {formatJoinedAt(matchResult.joinedAt, locale)}
                  </p>
                ) : null}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
