"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { getGroupMatchingCopy } from "@/features/groups/group-matching-copy";
import { useGroupMatching } from "@/features/groups/hooks/use-group-matching";
import { formatGroupLabel, formatJoinedAt } from "@/features/groups/utils/group-format";
import type { Dictionary, Locale } from "@/i18n/types";
import { Button } from "@/shared/ui/button";
import { StatusBadge } from "@/shared/ui/status-badge";

function MatchIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5">
      <path
        fill="currentColor"
        d="M12 3.25a8.75 8.75 0 1 0 8.75 8.75A8.76 8.76 0 0 0 12 3.25Zm0 2a6.75 6.75 0 1 1-6.75 6.75A6.76 6.76 0 0 1 12 5.25Zm0 2.25a1 1 0 0 1 1 1v2.5h2.5a1 1 0 1 1 0 2H13v2.5a1 1 0 1 1-2 0V13H8.5a1 1 0 1 1 0-2H11V8.5a1 1 0 0 1 1-1Z"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4">
      <path
        fill="currentColor"
        d="M9.55 16.85a1 1 0 0 1-.72-.3l-3.3-3.3a1 1 0 1 1 1.42-1.42l2.58 2.58 7.5-7.5a1 1 0 0 1 1.42 1.42l-8.22 8.22a1 1 0 0 1-.68.3Z"
      />
    </svg>
  );
}

function ProfileSignal({
  complete,
  label,
  value,
}: {
  complete: boolean;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-3">
      <span
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
          complete ? "bg-emerald-400 text-slate-950" : "bg-white/10 text-slate-500"
        }`}
      >
        <CheckIcon />
      </span>
      <span className="min-w-0">
        <span className="block text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
          {label}
        </span>
        <span className="mt-0.5 block truncate text-sm font-medium text-slate-100">
          {value}
        </span>
      </span>
    </div>
  );
}

function MatchingRadar({ active }: { active: boolean }) {
  return (
    <div className="relative mx-auto flex aspect-square w-full max-w-[15rem] items-center justify-center overflow-hidden rounded-full border border-cyan-300/20 bg-[radial-gradient(circle,rgba(34,211,238,0.18)_0%,rgba(34,211,238,0.04)_42%,transparent_70%)] sm:max-w-[19rem]">
      <div className="absolute inset-8 rounded-full border border-cyan-300/15" />
      <div className="absolute inset-16 rounded-full border border-cyan-300/20" />
      <div className="absolute inset-24 rounded-full border border-cyan-300/25" />
      <div
        className={`absolute left-1/2 top-1/2 h-1/2 w-1/2 origin-top-left rounded-tl-full bg-[conic-gradient(from_270deg,rgba(34,211,238,0.45),transparent_45deg)] ${
          active ? "animate-match-sweep" : ""
        }`}
      />
      <span className="absolute left-[21%] top-[33%] h-3 w-3 rounded-full bg-cyan-300 shadow-[0_0_20px_rgba(103,232,249,0.9)]" />
      <span className="absolute right-[22%] top-[45%] h-2.5 w-2.5 rounded-full bg-emerald-300 shadow-[0_0_18px_rgba(110,231,183,0.8)]" />
      <span className="absolute bottom-[24%] left-[38%] h-2 w-2 rounded-full bg-amber-300 shadow-[0_0_18px_rgba(252,211,77,0.8)]" />
      <div className="relative flex h-24 w-24 items-center justify-center rounded-full border border-cyan-300/30 bg-slate-950/90 text-cyan-100 shadow-[0_0_35px_rgba(34,211,238,0.22)]">
        <div className={active ? "animate-match-pulse" : ""}>
          <MatchIcon />
        </div>
      </div>
    </div>
  );
}

function ProgressSteps({
  active,
  labels,
}: {
  active: boolean;
  labels: readonly string[];
}) {
  return (
    <div className="grid gap-2">
      {labels.map((label, index) => (
        <div
          key={label}
          className={`flex items-center gap-3 rounded-2xl border px-3 py-3 transition ${
            active
              ? "border-cyan-300/25 bg-cyan-300/[0.07]"
              : "border-white/10 bg-white/[0.04]"
          }`}
          style={{ transitionDelay: `${index * 80}ms` }}
        >
          <span
            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
              active
                ? "bg-cyan-300 text-slate-950 shadow-[0_0_18px_rgba(103,232,249,0.35)]"
                : "bg-white/10 text-slate-400"
            }`}
          >
            {index + 1}
          </span>
          <span className="text-sm font-medium text-slate-200">{label}</span>
        </div>
      ))}
    </div>
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
  const hydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const t = getGroupMatchingCopy(dictionary);
  const { currentUser, error, findGroup, loading, matchResult, profileSignals } =
    useGroupMatching(dictionary);
  const levelReady = Boolean(currentUser?.englishLevel);
  const goalReady = Boolean(currentUser?.practiceGoal);
  const interestsReady = Boolean(currentUser?.interests?.length);
  const profileReady = Boolean(currentUser?.profileCompleted);

  return (
    <main className="tc-match-page min-h-screen bg-[radial-gradient(circle_at_50%_0%,rgba(34,211,238,0.18),transparent_34%),linear-gradient(180deg,#020617_0%,#050816_58%,#020617_100%)] text-white">
      <div className="mx-auto flex min-h-dvh w-full max-w-7xl flex-col px-4 py-4 sm:py-5 lg:px-6 lg:py-7">
        <header className="mb-4 flex items-center justify-between gap-3 sm:mb-5">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-300 sm:text-xs sm:tracking-[0.35em]">
              {dictionary.appName}
            </p>
            <h1 className="mt-2 text-lg font-semibold sm:text-2xl">{t.eyebrow}</h1>
          </div>
          <Link
            href="/conversations"
            className="shrink-0 rounded-full border border-white/15 px-3 py-2 text-sm font-semibold text-slate-100 transition hover:border-cyan-300/50 hover:bg-cyan-300/10 sm:px-4"
          >
            {t.secondary}
          </Link>
        </header>

        <section className="grid flex-1 gap-4 sm:gap-5 lg:grid-cols-[minmax(0,0.92fr)_minmax(26rem,0.72fr)]">
          <div className="flex min-h-0 flex-col gap-5">
            <div className="tc-card relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-2xl shadow-cyan-950/20 sm:rounded-[2rem] sm:p-7">
              <div className="absolute right-0 top-0 h-44 w-44 rounded-full bg-cyan-300/10 blur-3xl" />
              <div className="relative max-w-3xl">
                <span className="inline-flex rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-1 text-xs font-bold text-cyan-100">
                  {hydrated && profileReady ? t.profileReady : hydrated ? t.profileMissing : ""}
                </span>
                <h2 className="mt-4 max-w-2xl text-2xl font-bold leading-tight tracking-tight sm:mt-5 sm:text-5xl">
                  {t.title}
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300 sm:mt-4 sm:text-base sm:leading-8">
                  {t.description}
                </p>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <Button
                    type="button"
                    onClick={() => void findGroup()}
                    disabled={loading}
                    className="h-12 w-full px-7 text-base sm:w-auto"
                    aria-busy={loading}
                  >
                    {loading ? t.statusLoading : t.primary}
                  </Button>
                  {!profileReady ? (
                    <Link
                      href="/auth/complete-profile"
                      className="inline-flex h-12 w-full items-center justify-center rounded-full border border-white/15 px-6 text-sm font-semibold text-white transition hover:border-cyan-300/40 hover:bg-cyan-300/10 sm:w-auto"
                    >
                      {t.completeProfileNow}
                    </Link>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
              <aside className="tc-card rounded-2xl border border-white/10 bg-slate-950/70 p-4 sm:rounded-[1.75rem] sm:p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">
                      {t.profileChecklistTitle}
                    </p>
                    <h3 className="mt-2 truncate text-lg font-semibold">
                      {currentUser?.displayName || currentUser?.email || t.noProfile}
                    </h3>
                  </div>
                  <StatusBadge tone={profileReady ? "success" : "info"}>
                    {profileReady ? t.readyLabel : t.improveLabel}
                  </StatusBadge>
                </div>
                <p className="mt-3 text-sm leading-7 text-slate-400">{t.profileHint}</p>
                <div className="mt-4 grid gap-3">
                  <ProfileSignal
                    complete={levelReady}
                    label={t.levelLabel}
                    value={profileSignals.currentLevel}
                  />
                  <ProfileSignal
                    complete={goalReady}
                    label={t.goalLabel}
                    value={profileSignals.currentGoal}
                  />
                  <ProfileSignal
                    complete={interestsReady}
                    label={t.interestsLabel}
                    value={profileSignals.currentInterests}
                  />
                </div>
              </aside>

              <section className="tc-card rounded-2xl border border-white/10 bg-slate-950/70 p-4 sm:rounded-[1.75rem] sm:p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">
                      {t.howItWorksTitle}
                    </p>
                    <h3 className="mt-2 text-lg font-semibold">{t.supportTitle}</h3>
                  </div>
                  <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-300">
                    MVP
                  </span>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {t.signals.map((item) => (
                    <div
                      key={item}
                      className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-200"
                    >
                      {item}
                    </div>
                  ))}
                </div>
                <details className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                  <summary className="cursor-pointer text-sm font-semibold text-slate-100">
                    {t.rulesSummary}
                  </summary>
                  <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-400">
                    {t.rules.map((rule) => (
                      <li key={rule} className="flex gap-2">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-300" />
                        <span>{rule}</span>
                      </li>
                    ))}
                  </ul>
                </details>
              </section>
            </div>
          </div>

          <section
            className="tc-card order-first flex flex-col rounded-2xl border border-white/10 bg-slate-950/80 p-4 shadow-2xl shadow-black/30 sm:rounded-[2rem] sm:p-6 lg:order-none lg:min-h-[38rem]"
            aria-live="polite"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">
                  {matchResult?.action === "no_new_group_available" ? t.noNewGroupTitle : matchResult?.action === "already_in_group" ? t.currentGroupTitle : matchResult ? t.successTitle : t.actionPanelTitle}
                </p>
                <h2 className="mt-2 text-2xl font-bold">
                  {matchResult?.action === "no_new_group_available" ? t.noNewGroup : matchResult?.action === "already_in_group" ? t.alreadyInGroup : matchResult ? t.joinedGroup : t.actionPanelHeading}
                </h2>
              </div>
              {matchResult ? (
                <StatusBadge tone={matchResult.createdNewGroup ? "info" : "success"}>
                  {matchResult.action === "no_new_group_available" ? t.noNewGroupBadge : matchResult.action === "already_in_group" ? t.currentGroupBadge : matchResult.createdNewGroup ? t.newGroup : t.joinedGroup}
                </StatusBadge>
              ) : null}
            </div>

            {!matchResult ? (
              <div className="flex flex-1 flex-col">
                <div className="py-5 sm:py-8">
                  <MatchingRadar active={loading} />
                </div>
                <ProgressSteps active={loading} labels={t.matchingSteps} />
                <p className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm leading-7 text-slate-300">
                  {loading ? t.loadingHint : t.actionPanelHint}
                </p>
                {error ? (
                  <div
                    className="tc-alert-danger mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-100"
                    role="alert"
                  >
                    <p className="font-semibold">{t.matchErrorTitle}</p>
                    <p className="mt-2 leading-7">{error}</p>
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="mt-5 flex flex-1 flex-col gap-4">
                <div className={matchResult.action === "no_new_group_available" ? "hidden" : "rounded-2xl border border-cyan-300/25 bg-[radial-gradient(circle_at_20%_0%,rgba(34,211,238,0.18),transparent_34%),rgba(255,255,255,0.05)] p-4 sm:rounded-[1.75rem] sm:p-5"}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-sm text-slate-400">
                        {matchResult.groupName || t.yourGroup}
                      </p>
                      <h3 className="mt-1 truncate text-2xl font-bold text-white">
                        {matchResult.groupName || t.yourGroup}
                      </h3>
                    </div>
                    <div className="shrink-0 rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-right">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                        {t.sizeLabel}
                      </p>
                      <p className="mt-1 text-sm font-bold text-white">
                        {matchResult.memberCount ?? 0}
                        {matchResult.maxMembers ? ` / ${matchResult.maxMembers}` : ""}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {matchResult.targetLevel ? (
                      <span className="rounded-full border border-white/10 bg-slate-950/70 px-3 py-1 text-xs text-slate-200">
                        {t.levelLabel}: {formatGroupLabel(matchResult.targetLevel, dictionary)}
                      </span>
                    ) : null}
                    {matchResult.matchedGoal ? (
                      <span className="rounded-full border border-white/10 bg-slate-950/70 px-3 py-1 text-xs text-slate-200">
                        {t.goalLabel}: {formatGroupLabel(matchResult.matchedGoal, dictionary)}
                      </span>
                    ) : null}
                  </div>

                  {matchResult.groupDescription ? (
                    <p className="mt-4 text-sm leading-7 text-slate-300">
                      {matchResult.groupDescription}
                    </p>
                  ) : null}
                </div>

                {matchResult.matchedReason ? (
                  <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">
                      {t.reasonLabel}
                    </p>
                    <p className="mt-2 text-sm leading-7 text-slate-200">
                      {matchResult.matchedReason}
                    </p>
                  </div>
                ) : null}

                {matchResult.sharedInterests?.length ? (
                  <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
                    <p className="text-sm font-semibold text-white">{t.interestsLabel}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {matchResult.sharedInterests.map((interest) => (
                        <span
                          key={interest}
                          className="rounded-full border border-white/10 bg-slate-950/70 px-3 py-1 text-xs text-slate-200"
                        >
                          {formatGroupLabel(interest, dictionary)}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}

                <div className="mt-auto grid gap-3 sm:grid-cols-2">
                  {matchResult.action !== "no_new_group_available" ? (
                    <Button
                      type="button"
                      onClick={() => router.push(`/conversations/${matchResult.groupId}`)}
                      className="h-12"
                    >
                      {t.openChat}
                    </Button>
                  ) : null}
                  <Button
                    type="button"
                    onClick={() => {
                      if (!profileReady) {
                        router.push("/auth/complete-profile");
                        return;
                      }
                      void findGroup();
                    }}
                    disabled={loading || !profileReady}
                    variant="secondary"
                    className="h-12"
                  >
                    {t.searchAgain}
                  </Button>
                </div>

                {matchResult.joinedAt ? (
                  <p className="text-xs text-slate-500">
                    {t.joinedAtLabel}: {formatJoinedAt(matchResult.joinedAt, locale)}
                  </p>
                ) : null}
              </div>
            )}
          </section>
        </section>
      </div>
    </main>
  );
}
