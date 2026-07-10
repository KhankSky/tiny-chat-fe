"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { AuthUserResponse } from "@/features/auth/types";
import {
  getGroupMessages,
  getMyStreakCached,
  markConversationRead,
  sendGroupMessage,
} from "@/features/chat/api/chat-api";
import { subscribeToGroupMessages } from "@/features/chat/realtime/group-message-subscription";
import {
  createOptimisticMessage,
  type LocalChatMessage,
} from "@/features/chat/utils/optimistic-message";
import type { PresenceEvent, ReadReceiptResponse, TypingEvent } from "@/features/chat/types";
import type { Dictionary } from "@/i18n/types";
import { getAccessToken } from "@/shared/auth/session";
import { StompClient } from "@/shared/realtime/stomp";

export type SocketStatus = "idle" | "connecting" | "connected" | "error";
export type TypingUser = {
  userId: number;
  displayName: string;
};

const messageHistoryCache = new Map<number, LocalChatMessage[]>();
const messageHistoryRequests = new Map<number, Promise<LocalChatMessage[]>>();
const lastSyncedReadMessageIds = new Map<number, number>();
export const GROUP_STREAK_CHANGED_EVENT = "tiny-chat:group-streak-changed";
export const PERSONAL_STREAK_CHANGED_EVENT = "tiny-chat:personal-streak-changed";

export function useChatRoom({
  currentUser,
  dictionary,
  groupId,
}: {
  currentUser: AuthUserResponse | null;
  dictionary: Dictionary;
  groupId: number;
}) {
  const copy = dictionary.chat;
  const [messages, setMessages] = useState<LocalChatMessage[]>(
    () => messageHistoryCache.get(groupId) ?? [],
  );
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [socketStatus, setSocketStatus] = useState<SocketStatus>("idle");
  const [socketError, setSocketError] = useState<string | null>(null);
  const [typingUsers, setTypingUsers] = useState<Record<number, TypingUser>>({});
  const [presenceByUser, setPresenceByUser] = useState<Record<number, boolean>>(() =>
    currentUser?.userId ? { [currentUser.userId]: true } : {},
  );
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const stompClientRef = useRef<StompClient | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const typingStopTimeoutRef = useRef<number | null>(null);
  const lastTypingSentRef = useRef(false);
  const lastReadMessageIdRef = useRef<number | null>(null);
  const lastReadByUserRef = useRef<Record<number, number>>({});
  const accessToken = useMemo(() => getAccessToken(), []);

  const notifyGroupStreakChanged = useCallback(() => {
    window.dispatchEvent(new CustomEvent(GROUP_STREAK_CHANGED_EVENT, { detail: { groupId } }));
  }, [groupId]);

  const refreshPersonalStreak = useCallback(async () => {
    if (!accessToken) return;

    try {
      const nextStreak = await getMyStreakCached({ force: true });
      window.dispatchEvent(
        new CustomEvent(PERSONAL_STREAK_CHANGED_EVENT, { detail: nextStreak }),
      );
    } catch {
      // Streak refresh is secondary metadata; message delivery should stay quiet.
    }
  }, [accessToken]);

  useEffect(() => {
    let active = true;
    const client = accessToken ? new StompClient(accessToken) : null;
    stompClientRef.current = client;
    lastTypingSentRef.current = false;
    lastReadMessageIdRef.current = null;
    lastReadByUserRef.current = {};

    async function loadHistoryAndConnect() {
      try {
        setLoading(!messageHistoryCache.has(groupId));
        setError(null);

        let historyRequest = messageHistoryRequests.get(groupId);
        if (!historyRequest) {
          historyRequest = getGroupMessages(groupId).then((history) => history.items);
          messageHistoryRequests.set(groupId, historyRequest);
        }

        const historyMessages = await historyRequest;
        messageHistoryCache.set(groupId, historyMessages);
        if (active) {
          setMessages(historyMessages);
        }

        if (!client) {
          if (active) {
            setSocketStatus("error");
            setSocketError(copy.realtimeSignInRequired);
          }
          return;
        }

        if (active) {
          setSocketStatus("connecting");
          setSocketError(null);
        }

        await client.connect();
        if (!active) return;

        setSocketStatus("connected");
        const unsubscribers = [
          subscribeToGroupMessages({
            client,
            groupId,
            invalidDataMessage: copy.invalidChatData,
            onMessage: (message) => {
              notifyGroupStreakChanged();
              if (message.senderId === currentUser?.userId) {
                void refreshPersonalStreak();
              }
            },
            onInvalidData: setSocketError,
            setMessages: (updater) =>
              setMessages((previousMessages) => {
                const nextMessages = updater(previousMessages);
                messageHistoryCache.set(groupId, nextMessages);
                return nextMessages;
              }),
            unknownErrorMessage: copy.unknownSocketError,
          }),
          client.subscribe(`/topic/groups/${groupId}/typing`, (body) => {
            const payload = JSON.parse(body) as TypingEvent;
            if (payload.userId === currentUser?.userId) return;
            setTypingUsers((previous) => {
              if (!payload.typing) {
                const next = { ...previous };
                delete next[payload.userId];
                return next;
              }
              return {
                ...previous,
                [payload.userId]: {
                  userId: payload.userId,
                  displayName: payload.displayName,
                },
              };
            });
          }),
          client.subscribe(`/topic/groups/${groupId}/presence`, (body) => {
            const payload = JSON.parse(body) as PresenceEvent;
            setPresenceByUser((previous) => ({
              ...previous,
              [payload.userId]: payload.online,
            }));
          }),
          client.subscribe(`/topic/groups/${groupId}/read`, (body) => {
            const payload = JSON.parse(body) as ReadReceiptResponse;
            const previousReadMessageId = lastReadByUserRef.current[payload.userId] ?? 0;
            lastReadByUserRef.current[payload.userId] = Math.max(
              previousReadMessageId,
              payload.messageId,
            );
            setMessages((previousMessages) => {
              const nextMessages = previousMessages.map((message) => {
                const isOwnReceipt = payload.userId === currentUser?.userId;
                const advancedPastMessage =
                  message.messageId > previousReadMessageId &&
                  message.messageId <= payload.messageId;
                return {
                  ...message,
                  readByCurrentUser:
                    isOwnReceipt && message.messageId <= payload.messageId
                      ? true
                      : message.readByCurrentUser,
                  readCount:
                    payload.userId !== message.senderId && !isOwnReceipt && advancedPastMessage
                      ? message.readCount + 1
                      : message.readCount,
                };
              });
              messageHistoryCache.set(groupId, nextMessages);
              return nextMessages;
            });
          }),
        ];
        unsubscribeRef.current = () => {
          for (const unsubscribe of unsubscribers) {
            unsubscribe();
          }
        };
      } catch (err) {
        if (active) {
          const message = err instanceof Error ? err.message : copy.loadMessagesError;
          if (message.toLowerCase().includes("websocket")) {
            setSocketStatus("error");
            setSocketError(message);
          } else {
            setError(message);
          }
        }
      } finally {
        messageHistoryRequests.delete(groupId);
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadHistoryAndConnect();

    return () => {
      active = false;
      if (typingStopTimeoutRef.current) {
        window.clearTimeout(typingStopTimeoutRef.current);
        typingStopTimeoutRef.current = null;
      }
      unsubscribeRef.current?.();
      unsubscribeRef.current = null;
      stompClientRef.current?.disconnect();
      stompClientRef.current = null;
    };
  }, [
    accessToken,
    currentUser?.userId,
    copy.invalidChatData,
    copy.loadMessagesError,
    copy.realtimeSignInRequired,
    copy.unknownSocketError,
    groupId,
    notifyGroupStreakChanged,
    refreshPersonalStreak,
  ]);

  useLayoutEffect(() => {
    const bottomElement = bottomRef.current;
    if (!bottomElement) return;

    const frameId = window.requestAnimationFrame(() => {
      bottomElement.scrollIntoView({ behavior: "smooth", block: "end" });
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [messages, typingUsers]);

  const publishTyping = useCallback(
    (typing: boolean) => {
      if (!stompClientRef.current || socketStatus !== "connected") return;
      if (lastTypingSentRef.current === typing) return;
      lastTypingSentRef.current = typing;
      stompClientRef.current.send(`/app/groups/${groupId}/typing`, { typing });
    },
    [groupId, socketStatus],
  );

  useEffect(() => {
    if (!content.trim()) {
      if (typingStopTimeoutRef.current) {
        window.clearTimeout(typingStopTimeoutRef.current);
        typingStopTimeoutRef.current = null;
      }
      publishTyping(false);
      return;
    }

    publishTyping(true);
    if (typingStopTimeoutRef.current) {
      window.clearTimeout(typingStopTimeoutRef.current);
    }
    typingStopTimeoutRef.current = window.setTimeout(() => {
      publishTyping(false);
      typingStopTimeoutRef.current = null;
    }, 1500);
  }, [content, publishTyping]);

  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage?.messageId || lastMessage.messageId < 0 || !currentUser?.userId) return;
    if (lastReadMessageIdRef.current === lastMessage.messageId) return;
    const lastSyncedMessageId = lastSyncedReadMessageIds.get(groupId) ?? 0;
    if (lastMessage.messageId <= lastSyncedMessageId) {
      lastReadMessageIdRef.current = lastMessage.messageId;
      return;
    }
    lastReadMessageIdRef.current = lastMessage.messageId;
    lastSyncedReadMessageIds.set(groupId, lastMessage.messageId);

    const isConnected = stompClientRef.current && socketStatus === "connected";
    if (isConnected) {
      stompClientRef.current.send(`/app/groups/${groupId}/read`, {
        messageId: lastMessage.messageId,
      });
      return;
    }

    void markConversationRead(groupId, lastMessage.messageId).catch(() => {
      const syncedMessageId = lastSyncedReadMessageIds.get(groupId);
      if (syncedMessageId === lastMessage.messageId) {
        lastSyncedReadMessageIds.delete(groupId);
      }
      // Read sync should not interrupt chat usage.
    });
  }, [currentUser?.userId, groupId, messages, socketStatus]);

  async function sendMessage(replyTopic?: { id: number; content: string } | null) {
    const trimmed = content.trim();
    if (!trimmed) return;

    const optimisticMessage = createOptimisticMessage({
      content: trimmed,
      currentUser,
      fallbackSenderName: dictionary.common.you,
      groupId,
      replyTopicContent: replyTopic?.content ?? null,
      replyTopicId: replyTopic?.id ?? null,
    });
    setMessages((previousMessages) => {
      const nextMessages = [...previousMessages, optimisticMessage];
      messageHistoryCache.set(groupId, nextMessages);
      return nextMessages;
    });
    setContent("");
    publishTyping(false);

    try {
      if (stompClientRef.current && socketStatus === "connected") {
        stompClientRef.current.send(`/app/groups/${groupId}/messages`, {
          content: trimmed,
          replyTopicContent: replyTopic?.content,
          replyTopicId: replyTopic?.id,
        });
      } else {
        const newMessage = await sendGroupMessage(groupId, {
          content: trimmed,
          replyTopicContent: replyTopic?.content,
          replyTopicId: replyTopic?.id,
        });
        setMessages((previousMessages) => {
          const nextMessages = previousMessages.map((message) =>
            message.messageId === optimisticMessage.messageId ? newMessage : message,
          );
          messageHistoryCache.set(groupId, nextMessages);
          return nextMessages;
        });
        await refreshPersonalStreak();
        notifyGroupStreakChanged();
      }
    } catch (err) {
      setMessages((previousMessages) => {
        const nextMessages = previousMessages.filter(
          (message) => message.messageId !== optimisticMessage.messageId,
        );
        messageHistoryCache.set(groupId, nextMessages);
        return nextMessages;
      });
      setContent(trimmed);
      setSocketError(err instanceof Error ? err.message : copy.sendMessageError);
    }
  }

  return {
    bottomRef,
    content,
    error,
    loading,
    messages,
    presenceByUser,
    sendMessage,
    setContent,
    socketError,
    socketStatus,
    typingUsers: Object.values(typingUsers),
  };
}
