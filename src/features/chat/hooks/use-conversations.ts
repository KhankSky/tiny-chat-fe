"use client";

import { useEffect, useState } from "react";
import { getConversations } from "@/features/chat/api/chat-api";
import type { ConversationResponse } from "@/features/chat/types";
import type { ConversationItem } from "@/features/chat/components/conversation-sidebar";
import { formatDateTime } from "@/i18n/format";
import type { Dictionary, Locale } from "@/i18n/types";

function toConversationItem(
  conversation: ConversationResponse,
  locale: Locale,
  fallbackPreview: string,
): ConversationItem {
  return {
    conversationId: conversation.conversationId,
    groupId: conversation.groupId,
    title: conversation.title,
    preview: conversation.lastMessage || conversation.description || fallbackPreview,
    updatedAt: formatDateTime(conversation.lastMessageAt, locale),
  };
}

export function useConversations({
  dictionary,
  locale,
}: {
  dictionary: Dictionary;
  locale: Locale;
}) {
  const [conversations, setConversations] = useState<ConversationItem[]>([]);

  useEffect(() => {
    let active = true;

    async function loadConversations() {
      try {
        const data = await getConversations();
        if (active) {
          setConversations(
            data.map((conversation) =>
              toConversationItem(conversation, locale, dictionary.chat.noMessages),
            ),
          );
        }
      } catch {
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
