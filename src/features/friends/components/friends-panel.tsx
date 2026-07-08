"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { clearConversationCache } from "@/features/chat/hooks/use-conversations";
import {
  acceptFriendRequest,
  getFriendsCached,
  getIncomingFriendRequestsCached,
  openDirectConversation,
  rejectFriendRequest,
} from "@/features/friends/api/friends-api";
import type { FriendRequestResponse, FriendUserSummary } from "@/features/friends/types";
import type { Dictionary, Locale } from "@/i18n/types";
import { Avatar } from "@/shared/ui/avatar";

export function FriendsPanel({
  dictionary,
}: {
  dictionary: Dictionary;
  locale?: Locale;
}) {
  const router = useRouter();
  const t = dictionary.chat.friends;
  const [friends, setFriends] = useState<FriendUserSummary[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<FriendRequestResponse[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busyRequestId, setBusyRequestId] = useState<number | null>(null);
  const [busyFriendId, setBusyFriendId] = useState<number | null>(null);

  async function loadFriendsData() {
    try {
      setError(null);
      const [nextFriends, nextIncomingRequests] = await Promise.all([
        getFriendsCached({ force: true }),
        getIncomingFriendRequestsCached({ force: true }),
      ]);
      setFriends(nextFriends);
      setIncomingRequests(nextIncomingRequests);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.loadFriendsError);
    }
  }

  useEffect(() => {
    let active = true;

    async function loadInitialFriendsData() {
      try {
        const [nextFriends, nextIncomingRequests] = await Promise.all([
          getFriendsCached(),
          getIncomingFriendRequestsCached(),
        ]);
        if (active) {
          setError(null);
          setFriends(nextFriends);
          setIncomingRequests(nextIncomingRequests);
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : t.loadFriendsError);
        }
      }
    }

    void loadInitialFriendsData();
    return () => {
      active = false;
    };
  }, [t.loadFriendsError]);

  async function handleRequestAction(
    requestId: number,
    action: (requestId: number) => Promise<FriendRequestResponse>,
  ) {
    try {
      setBusyRequestId(requestId);
      setError(null);
      await action(requestId);
      await loadFriendsData();
      clearConversationCache();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.actionError);
    } finally {
      setBusyRequestId(null);
    }
  }

  async function handleOpenChat(friendId: number) {
    try {
      setBusyFriendId(friendId);
      setError(null);
      const conversation = await openDirectConversation(friendId);
      clearConversationCache();
      router.push(`/conversations/${conversation.conversationId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.actionError);
    } finally {
      setBusyFriendId(null);
    }
  }

  return (
    <div className="mt-4 border-t border-white/10 pt-4">
      <div className="mb-2 flex items-center justify-between px-3">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-300/90">
          {t.friendsTitle}
        </p>
        {incomingRequests.length > 0 ? (
          <span className="rounded-full bg-cyan-400 px-2 py-0.5 text-[11px] font-semibold text-slate-950">
            {incomingRequests.length}
          </span>
        ) : null}
      </div>

      {error ? (
        <p className="tc-alert-warning mx-3 rounded-xl border px-3 py-2 text-xs leading-5">
          {error}
        </p>
      ) : null}

      {incomingRequests.length > 0 ? (
        <div className="mb-3 space-y-2">
          {incomingRequests.map((request) => {
            const senderName = request.sender.displayName || request.sender.email;
            return (
              <div key={request.requestId} className="rounded-lg border border-cyan-400/20 bg-cyan-400/[0.06] p-3">
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

      <div className="space-y-1">
        {friends.length === 0 ? (
          <p className="px-3 py-2 text-sm text-slate-500">{t.noFriends}</p>
        ) : (
          friends.map((friend) => {
            const friendName = friend.displayName || friend.email;
            return (
              <button
                key={friend.userId}
                type="button"
                disabled={busyFriendId === friend.userId}
                onClick={() => handleOpenChat(friend.userId)}
                className="flex w-full items-center gap-3 rounded-2xl border border-transparent px-3 py-2 text-left transition hover:border-white/10 hover:bg-white/5 disabled:opacity-60"
              >
                <Avatar className="h-10 w-10 ring-1 ring-white/10" src={friend.avatarUrl} alt={friendName} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-white">{friendName}</span>
                  <span className="mt-0.5 block truncate text-xs text-slate-500">{t.openChat}</span>
                </span>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
