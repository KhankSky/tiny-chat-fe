"use client";

import { useEffect, useState } from "react";
import { getConversations } from "@/features/chat/api/chat-api";
import type { ConversationResponse, ConversationUpdateResponse } from "@/features/chat/types";
import type { ConversationItem } from "@/features/chat/components/conversation-sidebar";
import { formatConversationTime } from "@/i18n/format";
import type { Dictionary, Locale } from "@/i18n/types";
import { getAccessToken } from "@/shared/auth/session";
import { logClientError } from "@/shared/lib/logger";
import { StompClient } from "@/shared/realtime/stomp";

let cachedConversations: ConversationResponse[] | null = null;
let conversationsRequest: Promise<ConversationResponse[]> | null = null;

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
  const [conversations, setConversations] = useState<ConversationItem[]>(() =>
    cachedConversations
      ? cachedConversations.map((conversation) =>
          toConversationItem(conversation, locale, dictionary.chat.noMessages),
        )
      : [],
  );

  useEffect(() => {
    let active = true;
    const accessToken = getAccessToken();
    const client = accessToken ? new StompClient(accessToken) : null;
    let unsubscribe: (() => void) | null = null;

    async function loadConversations() {
      try {
        if (cachedConversations) {
          setConversations(
            cachedConversations.map((conversation) =>
              toConversationItem(conversation, locale, dictionary.chat.noMessages),
            ),
          );
          return;
        }

        conversationsRequest ??= getConversations();
        const data = await conversationsRequest;
        cachedConversations = data;
        if (active) {
          setConversations(
            data.map((conversation) =>
              toConversationItem(conversation, locale, dictionary.chat.noMessages),
            ),
          );
        }
      } catch {
        conversationsRequest = null;
        if (active) {
          setConversations([]);
        }
      }
    }

    void loadConversations();

    async function connectRealtime() {
      if (!client) return;

      try {
        await client.connect();
        if (!active) return;

        unsubscribe = client.subscribe("/user/queue/conversations", (body) => {
          try {
            const payload = JSON.parse(body) as ConversationUpdateResponse;
            if (payload.event !== "UPSERT") return;
            cachedConversations = upsertConversation(
              cachedConversations ?? [],
              payload.conversation,
            );
            if (active) {
              setConversations(
                cachedConversations.map((conversation) =>
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
  }, [dictionary.chat.noMessages, locale]);

  return conversations;
}
