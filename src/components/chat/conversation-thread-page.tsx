"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api/client";
import type { Locale } from "@/i18n/types";
import { ChatRoom } from "./chat-room";
import { ConversationSidebar, type ConversationItem } from "./conversation-sidebar";

type ConversationResponse = {
  conversationId: number;
  groupId: number;
  title: string;
  description: string | null;
  lastMessage: string | null;
  lastMessageAt: string | null;
  memberCount: number;
};

function toConversationItem(conversation: ConversationResponse): ConversationItem {
  return {
    conversationId: conversation.conversationId,
    groupId: conversation.groupId,
    title: conversation.title,
    preview: conversation.lastMessage || conversation.description || "No messages yet.",
    updatedAt: conversation.lastMessageAt
      ? new Date(conversation.lastMessageAt).toLocaleString()
      : "",
  };
}

export function ConversationThreadPage({
  locale,
  conversationId,
}: {
  locale: Locale;
  conversationId: number;
}) {
  const [conversations, setConversations] = useState<ConversationItem[]>([]);

  useEffect(() => {
    let active = true;

    async function loadConversations() {
      try {
        const data = await apiGet<ConversationResponse[]>("/api/conversations");
        if (active) {
          setConversations(data.map(toConversationItem));
        }
      } catch {
        if (active) {
          setConversations([]);
        }
      }
    }

    loadConversations();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="mx-auto grid min-h-screen max-w-7xl gap-6 px-4 py-4 lg:grid-cols-[360px_1fr] lg:px-6">
      <ConversationSidebar
        locale={locale}
        appName="Tiny Chat"
        conversations={conversations}
        activeGroupId={conversationId}
      />
      <ChatRoom locale={locale} groupId={conversationId} />
    </div>
  );
}
