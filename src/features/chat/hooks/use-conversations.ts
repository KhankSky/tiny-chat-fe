"use client";

import { useEffect, useState } from "react";
import { getConversations } from "@/features/chat/api/chat-api";
import type { ConversationResponse } from "@/features/chat/types";
import type { ConversationItem } from "@/features/chat/components/conversation-sidebar";
import { formatConversationTime } from "@/i18n/format";
import type { Dictionary, Locale } from "@/i18n/types";

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
  };
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

    return () => {
      active = false;
    };
  }, [dictionary.chat.noMessages, locale]);

  return conversations;
}
