"use client";

import { useEffect, useMemo, useState } from "react";
import type { AuthUserResponse } from "@/features/auth/types";
import { getGroupDetail } from "@/features/groups/api/groups-api";
import { getFriendProfile } from "@/features/friends/api/friends-api";
import type { FriendProfileResponse } from "@/features/friends/types";
import type { Dictionary, Locale } from "@/i18n/types";
import { Avatar } from "@/shared/ui/avatar";
import { ErrorMessage } from "@/shared/ui/error-message";
import { LoadingState } from "@/shared/ui/loading-state";

function enumLabel(labels: Record<string, string>, value: string | null) {
  if (!value) return null;
  return labels[value] ?? value;
}

export function DirectChatSidebar({
  dictionary,
  groupId,
  locale,
  currentUser,
}: {
  dictionary: Dictionary;
  groupId: number;
  locale: Locale;
  currentUser?: AuthUserResponse | null;
}) {
  const t = dictionary.chat.groupSidebar;
  const [profile, setProfile] = useState<FriendProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const displayName = useMemo(
    () => profile?.displayName || profile?.email || dictionary.common.userFallback,
    [dictionary.common.userFallback, profile?.displayName, profile?.email],
  );

  useEffect(() => {
    let active = true;

    async function loadDirectProfile() {
      try {
        setLoading(true);
        setError(null);
        const groupDetail = await getGroupDetail(groupId);
        const partner = groupDetail.members.find((member) => member.userId !== currentUser?.userId);
        if (!partner) {
          throw new Error("Conversation member not found");
        }
        const nextProfile = await getFriendProfile(partner.userId);
        if (active) {
          setProfile(nextProfile);
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : t.loadGroupError);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadDirectProfile();
    return () => {
      active = false;
    };
  }, [currentUser?.userId, groupId, t.loadGroupError]);

  const level = profile
    ? enumLabel(dictionary.enums.englishLevel as Record<string, string>, profile.englishLevel)
    : null;
  const goal = profile
    ? enumLabel(dictionary.enums.practiceGoal as Record<string, string>, profile.practiceGoal)
    : null;
  const interests =
    profile?.interests?.map((interest) =>
      enumLabel(dictionary.enums.interest as Record<string, string>, interest),
    ) ?? [];

  return (
    <aside className="tc-sidebar flex h-full min-h-0 flex-col overflow-hidden border-l border-white/10 bg-[#0b111c]">
      <div className="border-b border-white/10 px-5 py-4">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-300/90">
          Direct chat
        </p>
        <h2 className="mt-2 truncate text-xl font-semibold text-white">
          {profile ? displayName : t.loadingGroup}
        </h2>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-5">
        {loading ? (
          <LoadingState label={dictionary.common.loading} />
        ) : error ? (
          <ErrorMessage>{error}</ErrorMessage>
        ) : profile ? (
          <div className="space-y-5">
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
              <div className="flex items-start gap-4">
                <Avatar className="h-18 w-18 ring-1 ring-cyan-400/30" src={profile.avatarUrl} alt={displayName} />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">
                    Partner
                  </p>
                  <h3 className="mt-2 truncate text-2xl font-semibold text-white">{displayName}</h3>
                  <p className="mt-1 truncate text-sm text-slate-400">{profile.email}</p>
                </div>
              </div>
              <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-200">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Online status shown in chat
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                <p className="text-xs text-slate-500">Level</p>
                <p className="mt-1 text-sm font-semibold text-white">{level || t.unknownValue}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                <p className="text-xs text-slate-500">Goal</p>
                <p className="mt-1 text-sm font-semibold text-white">{goal || t.unknownValue}</p>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
                Interests
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {interests.length > 0 ? (
                  interests.map((interest) => (
                    <span
                      key={interest}
                      className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs text-cyan-100"
                    >
                      {interest}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-slate-400">{t.noInterests}</span>
                )}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
                Bio
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-300">{profile.bio || t.noBio}</p>
            </div>
          </div>
        ) : null}
      </div>
    </aside>
  );
}
