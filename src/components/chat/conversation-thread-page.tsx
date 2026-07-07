"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api/client";
import type { Locale } from "@/i18n/types";
import { ChatRoom } from "./chat-room";
import { ConversationSidebar, type ConversationItem } from "./conversation-sidebar";
import { GroupSidebar } from "./group-sidebar";

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
  const [detailsOpen, setDetailsOpen] = useState(true);

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

    void loadConversations();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="h-screen w-full overflow-hidden bg-[#070d18] text-white">
      <div
        className={`grid h-full min-h-0 w-full ${
          detailsOpen
            ? "lg:grid-cols-[340px_minmax(0,1fr)_360px]"
            : "lg:grid-cols-[340px_minmax(0,1fr)_72px]"
        }`}
      >
        <ConversationSidebar
          locale={locale}
          appName="Tiny Chat"
          conversations={conversations}
          activeGroupId={conversationId}
        />
        <ChatRoom
          locale={locale}
          groupId={conversationId}
          sidebarOpen={detailsOpen}
          onToggleSidebar={() => setDetailsOpen((value) => !value)}
        />
        <GroupSidebar
          locale={locale}
          groupId={conversationId}
          collapsed={!detailsOpen}
          onToggle={() => setDetailsOpen((value) => !value)}
        />
      </div>
    </div>
  );
}
