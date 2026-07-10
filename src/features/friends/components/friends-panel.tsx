"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  acceptFriendRequest,
  getFriendsCached,
  getIncomingFriendRequestsCached,
  openDirectConversation,
  rejectFriendRequest,
} from "@/features/friends/api/friends-api";
import type { FriendRequestResponse, FriendUserSummary } from "@/features/friends/types";
import type { Dictionary } from "@/i18n/types";
import { Avatar } from "@/shared/ui/avatar";

export function FriendsPanel({
  dictionary,
}: {
  dictionary: Dictionary;
}) {
  const router = useRouter();
  const t = dictionary.chat.friends;
  const [friends, setFriends] = useState<FriendUserSummary[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<FriendRequestResponse[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busyRequestId, setBusyRequestId] = useState<number | null>(null);
  const [busyFriendId, setBusyFriendId] = useState<number | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);

  async function loadFriendsData({ force = false }: { force?: boolean } = {}) {
    try {
      setLoading(true);
      setError(null);
      const [nextFriends, nextIncomingRequests] = await Promise.all([
        getFriendsCached({ force }),
        getIncomingFriendRequestsCached({ force }),
      ]);
      setFriends(nextFriends);
      setIncomingRequests(nextIncomingRequests);
      setLoaded(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.loadFriendsError);
    } finally {
      setLoading(false);
    }
  }

  function handleToggleExpanded() {
    const nextExpanded = !expanded;
    setExpanded(nextExpanded);
    if (nextExpanded && !loaded && !loading) {
      void loadFriendsData();
    }
  }

  async function handleRequestAction(
    requestId: number,
    action: (requestId: number) => Promise<FriendRequestResponse>,
  ) {
    try {
      setBusyRequestId(requestId);
      setError(null);
      await action(requestId);
      await loadFriendsData({ force: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : t.actionError);
    } finally {
      setBusyRequestId(null);
    }
  }

  async function handleOpenChat(friend: FriendUserSummary) {
    try {
      setBusyFriendId(friend.userId);
      setError(null);
      if (friend.directConversationId) {
        router.push(`/conversations/${friend.directConversationId}`);
        return;
      }

      const conversation = await openDirectConversation(friend.userId);
      router.push(`/conversations/${conversation.conversationId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.actionError);
    } finally {
      setBusyFriendId(null);
    }
  }

  return (
    <section className="mt-4 px-2">
      <div className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/[0.03]">
        <button
          type="button"
          onClick={handleToggleExpanded}
          className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-white/[0.04]"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-300/[0.08] text-cyan-200">
            <span aria-hidden="true">+</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-300/90">
              {t.friendsTitle}
            </p>
            <p className="mt-1 truncate text-sm text-slate-400">
              {loaded
                ? `${friends.length} ${t.friendsTitle.toLowerCase()}`
                : t.openChat}
            </p>
          </div>
          {loaded && incomingRequests.length > 0 ? (
            <span className="shrink-0 rounded-full bg-cyan-400 px-2 py-0.5 text-[11px] font-semibold text-slate-950">
              {incomingRequests.length}
            </span>
          ) : null}
          <span
            className={`shrink-0 text-sm text-slate-400 transition ${expanded ? "rotate-180" : ""}`}
            aria-hidden="true"
          >
            v
          </span>
        </button>

        {expanded ? (
          <div className="border-t border-white/10 px-3 py-3">
            {error ? (
              <p className="tc-alert-warning mb-3 rounded-xl border px-3 py-2 text-xs leading-5">
                {error}
              </p>
            ) : null}

            {loading ? (
              <p className="px-2 py-3 text-sm text-slate-400">{dictionary.common.loading}</p>
            ) : null}

            {!loading && incomingRequests.length > 0 ? (
              <div className="mb-3 space-y-2">
                {incomingRequests.map((request) => {
                  const senderName = request.sender.displayName || request.sender.email;
                  return (
                    <div
                      key={request.requestId}
                      className="rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.06] p-3"
                    >
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8" src={request.sender.avatarUrl} alt={senderName} />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-white">{senderName}</p>
                          <p className="truncate text-xs text-slate-400">{t.sentRequest}</p>
                        </div>
                      </div>
                      <div className="mt-3 flex gap-2">
                        <button
                          type="button"
                          disabled={busyRequestId === request.requestId}
                          onClick={() => handleRequestAction(request.requestId, acceptFriendRequest)}
                          className="rounded-full bg-cyan-400 px-3 py-1.5 text-xs font-semibold text-slate-950 disabled:opacity-60"
                        >
                          {t.accept}
                        </button>
                        <button
                          type="button"
                          disabled={busyRequestId === request.requestId}
                          onClick={() => handleRequestAction(request.requestId, rejectFriendRequest)}
                          className="rounded-full border border-white/15 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
                        >
                          {t.reject}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : null}

            {!loading ? (
              <div className="space-y-1">
                {friends.length === 0 ? (
                  <p className="px-2 py-2 text-sm text-slate-500">{t.noFriends}</p>
                ) : (
                  friends.map((friend) => {
                    const friendName = friend.displayName || friend.email;
                    return (
                      <button
                        key={friend.userId}
                        type="button"
                        disabled={busyFriendId === friend.userId}
                        onClick={() => handleOpenChat(friend)}
                        className="flex w-full items-center gap-3 rounded-2xl border border-transparent px-3 py-2 text-left transition hover:border-white/10 hover:bg-white/5 disabled:opacity-60"
                      >
                        <Avatar
                          className="h-10 w-10 ring-1 ring-white/10"
                          src={friend.avatarUrl}
                          alt={friendName}
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold text-white">
                            {friendName}
                          </span>
                          <span className="mt-0.5 block truncate text-xs text-slate-500">
                            {t.openChat}
                          </span>
                        </span>
                      </button>
                    );
                  })
                )}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
