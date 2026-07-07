"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { AuthUserResponse } from "@/features/auth/types";
import { matchGroup } from "@/features/groups/api/groups-api";
import type { MatchGroupResponse } from "@/features/groups/types";
import { formatDateTime } from "@/i18n/format";
import type { Dictionary, Locale } from "@/i18n/types";
import { getStoredAuthUser } from "@/shared/auth/session";

type CurrentUser = Pick<
  AuthUserResponse,
  "displayName" | "englishLevel" | "practiceGoal" | "interests" | "profileCompleted" | "email"
>;

function formatLabel(value: string | null | undefined, dictionary: Dictionary) {
  if (!value) return null;

  const labels: Record<string, string> = {
    ...dictionary.enums.englishLevel,
    ...dictionary.enums.practiceGoal,
    ...dictionary.enums.interest,
  };

  return (
    labels[value] ||
    value
      .split("_")
      .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
      .join(" ")
  );
}

export function GroupMatchingPage({
  locale,
  dictionary,
}: {
  locale: Locale;
  dictionary: Dictionary;
}) {
  const router = useRouter();
  const t = dictionary.groups;
  const [matchResult, setMatchResult] = useState<MatchGroupResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentUser = useMemo(() => {
    const stored = getStoredAuthUser() as CurrentUser | null;
    return stored;
  }, []);

  async function handleFindGroup() {
    setError(null);
    setLoading(true);

    try {
      const result = await matchGroup();
      setMatchResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.matchErrorFallback);
    } finally {
      setLoading(false);
    }
  }

  const currentLevel = currentUser?.englishLevel
    ? formatLabel(currentUser.englishLevel, dictionary)
    : t.levelUnknown;
  const currentGoal = currentUser?.practiceGoal
    ? formatLabel(currentUser.practiceGoal, dictionary)
    : t.goalUnknown;
  const currentInterests = currentUser?.interests?.length
    ? `${currentUser.interests.length} ${t.interestsCount}`
    : t.noInterests;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.18),_transparent_36%),linear-gradient(180deg,_#020617_0%,_#020617_100%)] text-white">
      <div className="mx-auto max-w-7xl px-4 py-6 lg:px-6 lg:py-8">
        <div className="mb-6 flex flex-col gap-4 rounded-[2rem] border border-white/10 bg-white/5 p-5 backdrop-blur lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-300">
              {dictionary.appName}
            </p>
            <h1 className="mt-2 text-2xl font-semibold">{t.eyebrow}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-300">
              {t.description}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href={`/${locale}/conversations`}
              className="rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-white transition hover:border-white/30 hover:bg-white/5"
            >
              {t.secondary}
            </Link>
            <button
              type="button"
              onClick={() => void handleFindGroup()}
              disabled={loading}
              className="rounded-full bg-cyan-400 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? t.statusLoading : t.primary}
            </button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="space-y-6">
            <div className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 shadow-2xl shadow-cyan-950/20">
              <div className="grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
                <div className="space-y-4">
                  <div className="inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-200">
                    {t.statusIdle}
                  </div>
                  <h2 className="text-3xl font-semibold leading-tight">{t.title}</h2>
                  <p className="max-w-2xl text-sm leading-7 text-slate-300">
                    {t.supportText}
                  </p>
                </div>

                <div className="space-y-3 rounded-3xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                        {currentUser?.profileCompleted ? t.profileReady : t.profileMissing}
                      </p>
                      <p className="mt-2 text-sm font-semibold text-white">
                        {currentUser?.displayName || currentUser?.email || t.noProfile}
                      </p>
                    </div>
                    <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-300">
                      MVP
                    </span>
                  </div>
                  <p className="text-sm leading-7 text-slate-300">{t.profileHint}</p>
                  {!currentUser?.profileCompleted ? (
                    <Link
                      href={`/${locale}/auth/complete-profile`}
                      className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:border-cyan-400/30 hover:bg-cyan-400/15"
                    >
                      {t.completeProfileNow}
                    </Link>
                  ) : null}
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-200">
                      {currentLevel}
                    </span>
                    <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-200">
                      {currentGoal}
                    </span>
                    <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-200">
                      {currentInterests}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <article className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
                <p className="text-sm font-semibold text-white">{t.bestPracticeTitle}</p>
                <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-300">
                  {t.rules.map((rule) => (
                    <li key={rule} className="flex gap-3">
                      <span className="mt-2 h-2 w-2 rounded-full bg-cyan-300" />
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </article>

              <article className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
                <p className="text-sm font-semibold text-white">{t.signalsTitle}</p>
                <div className="mt-4 grid gap-3">
                  {t.signals.map((item) => (
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
                  {t.statusIdle}
                </p>
                <h2 className="mt-2 text-2xl font-semibold">
                  {matchResult ? t.successTitle : t.primary}
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
                  {matchResult.createdNewGroup ? t.newGroup : t.joinedGroup}
                </span>
              ) : null}
            </div>

            {!matchResult ? (
              <div className="space-y-4">
                <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
                  <p className="text-sm leading-7 text-slate-300">{t.loadingHint}</p>
                </div>

                <button
                  type="button"
                  onClick={() => void handleFindGroup()}
                  disabled={loading}
                  className="inline-flex w-full items-center justify-center rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-70"
                  aria-busy={loading}
                >
                  {loading ? t.statusLoading : t.primary}
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
                    <p className="font-semibold">{t.matchErrorTitle}</p>
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
                        {matchResult.groupName || t.yourGroup}
                      </p>
                      <h3 className="mt-1 text-2xl font-semibold text-white">
                        #{matchResult.groupId}
                      </h3>
                    </div>
                    <div className="text-right">
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                        {t.sizeLabel}
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
                        {t.levelLabel}: {formatLabel(matchResult.targetLevel, dictionary)}
                      </span>
                    ) : null}
                    {matchResult.matchedGoal ? (
                      <span className="rounded-full border border-white/10 bg-slate-950/80 px-3 py-1 text-xs text-slate-200">
                        {t.goalLabel}: {formatLabel(matchResult.matchedGoal, dictionary)}
                      </span>
                    ) : null}
                    {matchResult.sharedInterests?.length ? (
                      <span className="rounded-full border border-white/10 bg-slate-950/80 px-3 py-1 text-xs text-slate-200">
                        {t.interestsLabel}: {matchResult.sharedInterests.length}
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
                        {t.reasonLabel}
                      </p>
                      <p className="mt-2 text-sm leading-7 text-slate-200">
                        {matchResult.matchedReason}
                      </p>
                    </div>
                  ) : null}
                </div>

                {matchResult.sharedInterests?.length ? (
                  <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
                    <p className="text-sm font-semibold text-white">{t.interestsLabel}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {matchResult.sharedInterests.map((interest) => (
                        <span
                          key={interest}
                          className="rounded-full border border-white/10 bg-slate-950/80 px-3 py-1 text-xs text-slate-200"
                        >
                          {formatLabel(interest, dictionary)}
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
                    {t.openChat}
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleFindGroup()}
                    disabled={loading}
                    className="rounded-full border border-white/15 px-5 py-3 text-sm font-medium text-white transition hover:border-white/30 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {t.searchAgain}
                  </button>
                </div>

                {matchResult.joinedAt ? (
                  <p className="text-xs text-slate-500">
                    {t.joinedAtLabel}: {formatDateTime(matchResult.joinedAt, locale)}
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
