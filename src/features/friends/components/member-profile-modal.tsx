"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  acceptFriendRequest,
  getGroupMemberProfile,
  openDirectConversation,
  rejectFriendRequest,
  sendFriendRequest,
} from "@/features/friends/api/friends-api";
import type { FriendProfileResponse } from "@/features/friends/types";
import type { Dictionary, Locale } from "@/i18n/types";
import { Avatar } from "@/shared/ui/avatar";
import { Button } from "@/shared/ui/button";
import { ErrorMessage } from "@/shared/ui/error-message";
import { LoadingState } from "@/shared/ui/loading-state";
import { Modal } from "@/shared/ui/modal";

function enumLabel(labels: Record<string, string>, value: string | null) {
  if (!value) return null;
  return labels[value] ?? value;
}

export function MemberProfileModal({
  dictionary,
  groupId,
  memberUserId,
  onClose,
}: {
  dictionary: Dictionary;
  groupId: number;
  locale?: Locale;
  memberUserId: number;
  onClose: () => void;
}) {
  const router = useRouter();
  const t = dictionary.chat.friends;
  const [profile, setProfile] = useState<FriendProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function loadProfile() {
    try {
      setError(null);
      const data = await getGroupMemberProfile(groupId, memberUserId);
      setProfile(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.loadProfileError);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;

    async function loadInitialProfile() {
      try {
        const data = await getGroupMemberProfile(groupId, memberUserId);
        if (active) {
          setError(null);
          setProfile(data);
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : t.loadProfileError);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadInitialProfile();
    return () => {
      active = false;
    };
  }, [groupId, memberUserId, t.loadProfileError]);

  async function runAction(action: () => Promise<unknown>) {
    try {
      setBusy(true);
      setActionError(null);
      await action();
      await loadProfile();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : t.actionError);
    } finally {
      setBusy(false);
    }
  }

  async function handleOpenChat() {
    if (!profile) return;
    try {
      setBusy(true);
      setActionError(null);
      if (profile.directConversationId) {
        router.push(`/conversations/${profile.directConversationId}`);
        return;
      }

      const conversation = await openDirectConversation(profile.userId);
      router.push(`/conversations/${conversation.conversationId}`);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : t.actionError);
    } finally {
      setBusy(false);
    }
  }

  const displayName = profile?.displayName || profile?.email || dictionary.common.userFallback;
  const level = enumLabel(dictionary.enums.englishLevel as Record<string, string>, profile?.englishLevel ?? null);
  const goal = enumLabel(dictionary.enums.practiceGoal as Record<string, string>, profile?.practiceGoal ?? null);
  const interests =
    profile?.interests?.map((interest) =>
      enumLabel(dictionary.enums.interest as Record<string, string>, interest),
    ) ?? [];

  return (
    <Modal ariaLabel={t.memberProfileTitle} onClose={onClose} className="max-w-lg p-5">
      {loading ? (
        <LoadingState label={dictionary.common.loading} />
      ) : error ? (
        <ErrorMessage>{error}</ErrorMessage>
      ) : profile ? (
        <div className="space-y-5">
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16 ring-1 ring-cyan-400/30" src={profile.avatarUrl} alt={displayName} />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">
                {t.memberProfileTitle}
              </p>
              <h3 className="mt-2 truncate text-2xl font-semibold text-white">{displayName}</h3>
              <p className="mt-1 truncate text-sm text-slate-400">{profile.email}</p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
              <p className="text-xs text-slate-500">{t.levelLabel}</p>
              <p className="mt-1 text-sm font-semibold text-white">{level || t.unknownValue}</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
              <p className="text-xs text-slate-500">{t.goalLabel}</p>
              <p className="mt-1 text-sm font-semibold text-white">{goal || t.unknownValue}</p>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
              {t.interestsLabel}
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
              {t.bioLabel}
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-300">{profile.bio || t.noBio}</p>
          </div>

          {actionError ? <ErrorMessage>{actionError}</ErrorMessage> : null}

          <div className="flex flex-wrap gap-2">
            {profile.friendshipStatus === "NONE" ? (
              <Button
                type="button"
                disabled={busy}
                onClick={() => runAction(() => sendFriendRequest(profile.userId))}
              >
                {t.addFriend}
              </Button>
            ) : null}

            {profile.friendshipStatus === "OUTGOING_PENDING" ? (
              <Button type="button" disabled variant="secondary">
                {t.requestSent}
              </Button>
            ) : null}

            {profile.friendshipStatus === "INCOMING_PENDING" && profile.incomingRequestId ? (
              <>
                <Button
                  type="button"
                  disabled={busy}
                  onClick={() => runAction(() => acceptFriendRequest(profile.incomingRequestId!))}
                >
                  {t.accept}
                </Button>
                <Button
                  type="button"
                  disabled={busy}
                  variant="secondary"
                  onClick={() => runAction(() => rejectFriendRequest(profile.incomingRequestId!))}
                >
                  {t.reject}
                </Button>
              </>
            ) : null}

            {profile.friendshipStatus === "FRIEND" ? (
              <Button type="button" disabled={busy} onClick={handleOpenChat}>
                {t.openChat}
              </Button>
            ) : null}

            {profile.friendshipStatus === "SELF" ? (
              <Button type="button" disabled variant="secondary">
                {t.selfProfile}
              </Button>
            ) : null}

            <Button type="button" variant="ghost" onClick={onClose}>
              {dictionary.common.close}
            </Button>
          </div>
        </div>
      ) : null}
    </Modal>
  );
}
