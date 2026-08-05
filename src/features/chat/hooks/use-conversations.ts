"use client";

import { useEffect, useState } from "react";
import { getConversations } from "@/features/chat/api/chat-api";
import type { ConversationResponse, ConversationUpdateResponse } from "@/features/chat/types";
import type { ConversationItem } from "@/features/chat/components/conversation-sidebar";
import { formatConversationTime } from "@/i18n/format";
import type { Dictionary, Locale } from "@/i18n/types";
import { getAccessToken, getStoredAuthUser } from "@/shared/auth/session";
import { logClientError } from "@/shared/lib/logger";
import { StompClient } from "@/shared/realtime/stomp";

type ConversationCache = {
  userId: number;
  conversations: ConversationResponse[];
};

type ConversationRequest = {
  userId: number;
  promise: Promise<ConversationResponse[]>;
};

let cachedConversations: ConversationCache | null = null;
let conversationsRequest: ConversationRequest | null = null;

export function clearConversationCache() {
  cachedConversations = null;
  conversationsRequest = null;
}

function toConversationItem(
  conversation: ConversationResponse,
  locale: Locale,
  fallbackPreview: string,
): ConversationItem {
  return {
    conversationId: conversation.conversationId,
    groupId: conversation.groupId,
    directChat: conversation.directChat,
    conversationType: conversation.conversationType,
    title: conversation.title,
    avatarUrl: conversation.avatarUrl,
    preview: conversation.lastMessage || conversation.description || fallbackPreview,
    updatedAt: formatConversationTime(conversation.lastMessageAt, locale),
    unreadCount: conversation.unreadCount,
  };
}

function upsertConversation(
  conversations: ConversationResponse[],
  nextConversation: ConversationResponse,
) {
  const nextItems = conversations.some(
    (conversation) => conversation.conversationId === nextConversation.conversationId,
  )
    ? conversations.map((conversation) =>
        conversation.conversationId === nextConversation.conversationId
          ? nextConversation
          : conversation,
      )
    : [nextConversation, ...conversations];

  return nextItems.sort((left, right) => {
    const leftTime = left.lastMessageAt ? new Date(left.lastMessageAt).getTime() : 0;
    const rightTime = right.lastMessageAt ? new Date(right.lastMessageAt).getTime() : 0;
    return rightTime - leftTime;
  });
}

export function useConversations({
  dictionary,
  locale,
}: {
  dictionary: Dictionary;
  locale: Locale;
}) {
  const currentUserId = getStoredAuthUser()?.userId ?? null;
  const [conversations, setConversations] = useState<ConversationItem[]>(() =>
    cachedConversations?.userId === currentUserId
      ? cachedConversations.conversations.map((conversation) =>
          toConversationItem(conversation, locale, dictionary.chat.noMessages),
        )
      : [],
  );

  useEffect(() => {
    let active = true;
    const userId = getStoredAuthUser()?.userId ?? null;
    const accessToken = getAccessToken();
    const client = accessToken ? new StompClient(accessToken) : null;
    let unsubscribe: (() => void) | null = null;
    let request: ConversationRequest | null = null;

    async function loadConversations() {
      if (userId === null) {
        setConversations([]);
        return;
      }

      try {
        if (cachedConversations?.userId === userId) {
          setConversations(
            cachedConversations.conversations.map((conversation) =>
              toConversationItem(conversation, locale, dictionary.chat.noMessages),
            ),
          );
          return;
        }

        if (conversationsRequest?.userId !== userId) {
          conversationsRequest = { userId, promise: getConversations() };
        }
        request = conversationsRequest;
        const data = await request.promise;

        if (active && getStoredAuthUser()?.userId === userId) {
          cachedConversations = { userId, conversations: data };
          setConversations(
            data.map((conversation) =>
              toConversationItem(conversation, locale, dictionary.chat.noMessages),
            ),
          );
        }
        if (conversationsRequest?.promise === request.promise) {
          conversationsRequest = null;
        }
      } catch {
        if (conversationsRequest?.promise === request?.promise) {
          conversationsRequest = null;
        }
        if (active) {
          setConversations([]);
        }
      }
    }

    void loadConversations();

    async function connectRealtime() {
      if (!client || userId === null) return;

      try {
        await client.connect();
        if (!active) return;

        unsubscribe = client.subscribe("/user/queue/conversations", (body) => {
          try {
            const payload = JSON.parse(body) as ConversationUpdateResponse;
            if (payload.event !== "UPSERT") return;
            const currentCache = cachedConversations?.userId === userId
              ? cachedConversations.conversations
              : [];
            const nextConversations = upsertConversation(
              currentCache,
              payload.conversation,
            );
            cachedConversations = { userId, conversations: nextConversations };
            if (active) {
              setConversations(
                nextConversations.map((conversation) =>
                  toConversationItem(conversation, locale, dictionary.chat.noMessages),
                ),
              );
            }
          } catch (error) {
            logClientError("Received invalid conversation update", {
              error: error instanceof Error ? error.message : "Unknown error",
            });
          }
        });
      } catch {
        // Sidebar can stay on the last REST snapshot if realtime is unavailable.
      }
    }

    void connectRealtime();

    return () => {
      active = false;
      unsubscribe?.();
      client?.disconnect();
    };
  }, [currentUserId, dictionary.chat.noMessages, locale]);

  return conversations;
}
