"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { AuthUserResponse } from "@/features/auth/types";
import {
  getGroupMessages,
  refreshGroupStreakAfterActivityOnce,
  refreshMyStreakAfterActivityOnce,
  markConversationRead,
  sendGroupMessage,
} from "@/features/chat/api/chat-api";
import { subscribeToGroupMessages } from "@/features/chat/realtime/group-message-subscription";
import {
  createOptimisticMessage,
  type LocalChatMessage,
} from "@/features/chat/utils/optimistic-message";
import type {
  PresenceEvent,
  ReadReceiptResponse,
  TypingEvent,
} from "@/features/chat/types";
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
  const chatCanvasRef = useRef<HTMLDivElement | null>(null);
  const initialScrollDoneRef = useRef(false);
  const isAutoScrollingRef = useRef(false);
  const prevMessagesLengthRef = useRef(0);
  const stompClientRef = useRef<StompClient | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const typingStopTimeoutRef = useRef<number | null>(null);
  const lastTypingSentRef = useRef(false);
  const lastReadMessageIdRef = useRef<number | null>(null);
  const lastReadByUserRef = useRef<Record<number, number>>({});
  const nextHistoryPageRef = useRef(1);
  const hasOlderMessagesRef = useRef(true);
  const loadingOlderRef = useRef(false);
  const loadingOlderMessagesRef = useRef(false);
  const sendingMessageRef = useRef(false);
  const accessToken = useMemo(() => getAccessToken(), []);

  const refreshStreaksAfterFirstActivity = useCallback(async () => {
    if (!accessToken) return;
    try {
      const [groupStreak, personalStreak] = await Promise.all([
        refreshGroupStreakAfterActivityOnce(groupId),
        refreshMyStreakAfterActivityOnce(),
      ]);
      window.dispatchEvent(new CustomEvent(GROUP_STREAK_CHANGED_EVENT, { detail: groupStreak }));
      window.dispatchEvent(new CustomEvent(PERSONAL_STREAK_CHANGED_EVENT, { detail: personalStreak }));
    } catch {
      // Streak is secondary metadata and should not interrupt chat.
    }
  }, [accessToken, groupId]);

  useEffect(() => {
    let active = true;
    let client: StompClient | null = null;
    stompClientRef.current = null;
    lastTypingSentRef.current = false;
    lastReadMessageIdRef.current = null;
    lastReadByUserRef.current = {};
    nextHistoryPageRef.current = 1;
    hasOlderMessagesRef.current = true;
    loadingOlderRef.current = false;
    loadingOlderMessagesRef.current = false;
    initialScrollDoneRef.current = false;
    isAutoScrollingRef.current = false;
    prevMessagesLengthRef.current = 0;

    async function loadHistoryAndConnect() {
      try {
        setLoading(!messageHistoryCache.has(groupId));
        setError(null);

        let historyRequest = messageHistoryRequests.get(groupId);
        if (!historyRequest) {
          historyRequest = getGroupMessages(groupId).then((history) => {
            hasOlderMessagesRef.current = history.items.length >= history.size;
            return history.items;
          });
          messageHistoryRequests.set(groupId, historyRequest);
        }

        const historyMessages = await historyRequest;
        messageHistoryCache.set(groupId, historyMessages);
        if (active) {
          setMessages(historyMessages);
        }

        // REST requests may restore the access token from the refresh cookie.
        // Read it again here before deciding whether realtime is available.
        const restoredToken = getAccessToken();
        client = restoredToken ? new StompClient(restoredToken) : null;
        stompClientRef.current = client;

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
        if (!active || !client.isConnected()) return;

        setSocketStatus("connected");
        const unsubscribers = [
          subscribeToGroupMessages({
            client,
            groupId,
            invalidDataMessage: copy.invalidChatData,
            onMessage: (message) => {
              if (message.senderId === currentUser?.userId) {
                void refreshStreaksAfterFirstActivity();
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
                  readByUserIds:
                    payload.userId !== message.senderId && advancedPastMessage
                      ? Array.from(new Set([...(message.readByUserIds ?? []), payload.userId]))
                      : message.readByUserIds,
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
    refreshStreaksAfterFirstActivity,
  ]);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "instant") => {
    const container = chatCanvasRef.current ?? bottomRef.current?.parentElement;
    if (!container) return;

    isAutoScrollingRef.current = true;
    if (behavior === "instant" || behavior === "auto") {
      container.scrollTop = container.scrollHeight;
    } else {
      container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
    }

    requestAnimationFrame(() => {
      if (container && (behavior === "instant" || behavior === "auto")) {
        container.scrollTop = container.scrollHeight;
      }
      window.setTimeout(() => {
        isAutoScrollingRef.current = false;
      }, 100);
    });
  }, []);

  useLayoutEffect(() => {
    const container = chatCanvasRef.current ?? bottomRef.current?.parentElement;
    if (!container) return;

    if (loadingOlderMessagesRef.current) {
      loadingOlderMessagesRef.current = false;
      prevMessagesLengthRef.current = messages.length;
      return;
    }

    if (!initialScrollDoneRef.current) {
      if (!loading && messages.length > 0) {
        scrollToBottom("instant");
        initialScrollDoneRef.current = true;
      }
      prevMessagesLengthRef.current = messages.length;
      return;
    }

    const isNewMessageAdded = messages.length > prevMessagesLengthRef.current;
    prevMessagesLengthRef.current = messages.length;

    if (isNewMessageAdded || Object.keys(typingUsers).length > 0) {
      const lastMessage = messages[messages.length - 1];
      const isMine = lastMessage?.senderId === currentUser?.userId;
      const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;

      if (isMine || distanceFromBottom < 150) {
        scrollToBottom(isMine ? "instant" : "smooth");
      }
    }
  }, [currentUser?.userId, loading, messages, scrollToBottom, typingUsers]);

  useEffect(() => {
    const container = chatCanvasRef.current ?? bottomRef.current?.parentElement;
    if (!container) return;

    const observer = new ResizeObserver(() => {
      if (!initialScrollDoneRef.current || isAutoScrollingRef.current) {
        container.scrollTop = container.scrollHeight;
      } else {
        const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
        if (distanceFromBottom < 40) {
          container.scrollTop = container.scrollHeight;
        }
      }
    });

    observer.observe(container);
    if (container.firstElementChild) {
      observer.observe(container.firstElementChild as Element);
    }

    return () => {
      observer.disconnect();
    };
  }, [groupId]);

  const loadOlderMessages = useCallback(async () => {
    if (loadingOlderRef.current || !hasOlderMessagesRef.current) return false;
    loadingOlderRef.current = true;
    try {
      const history = await getGroupMessages(groupId, nextHistoryPageRef.current);
      const olderMessages = history.items;
      hasOlderMessagesRef.current = olderMessages.length >= history.size;
      nextHistoryPageRef.current += 1;
      if (olderMessages.length > 0) {
        setMessages((currentMessages) => {
          const existingIds = new Set(currentMessages.map((message) => message.messageId));
          const nextMessages = [
            ...olderMessages.filter((message) => !existingIds.has(message.messageId)),
            ...currentMessages,
          ];
          messageHistoryCache.set(groupId, nextMessages);
          loadingOlderMessagesRef.current = true;
          return nextMessages;
        });
      }
      return olderMessages.length > 0;
    } finally {
      loadingOlderRef.current = false;
    }
  }, [groupId]);

  const handleChatScroll = useCallback(async () => {
    const container = chatCanvasRef.current ?? bottomRef.current?.parentElement;
    if (!container) return;

    if (isAutoScrollingRef.current || !initialScrollDoneRef.current) return;
    if (container.scrollTop > 80) return;

    const previousHeight = container.scrollHeight;
    const loaded = await loadOlderMessages();
    if (!loaded) return;

    requestAnimationFrame(() => {
      if (container) {
        container.scrollTop += container.scrollHeight - previousHeight;
      }
    });
  }, [loadOlderMessages]);

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

    const client = stompClientRef.current;
    if (client && socketStatus === "connected") {
      client.send(`/app/groups/${groupId}/read`, {
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
    if (sendingMessageRef.current) return;

    const trimmed = content.trim();
    if (!trimmed) return;

    sendingMessageRef.current = true;

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
        // The server processes the message asynchronously over STOMP. Refresh
        // the two streak snapshots once after the first activity in this
        // session, without tying the update to the incoming message payload.
        window.setTimeout(() => {
          void refreshStreaksAfterFirstActivity();
        }, 300);
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
        await refreshStreaksAfterFirstActivity();
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
    } finally {
      // Prevent a key event and its form submit event from publishing the
      // same message before React applies the cleared input state.
      window.setTimeout(() => {
        sendingMessageRef.current = false;
      }, 0);
    }
  }

  return {
    bottomRef,
    chatCanvasRef,
    content,
    error,
    handleChatScroll,
    loading,
    loadOlderMessages,
    messages,
    presenceByUser,
    sendMessage,
    setContent,
    socketError,
    socketStatus,
    typingUsers: Object.values(typingUsers),
  };
}
