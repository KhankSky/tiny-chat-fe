"use client";

import { useMemo } from "react";
import type { Dictionary, Locale } from "@/i18n/types";
import { ChatRoom } from "./chat-room";
import { ConversationSidebar, type ConversationItem } from "./conversation-sidebar";

const defaultConversations: ConversationItem[] = [
  {
    groupId: 1,
    title: "English practice",
    preview: "Let's continue with daily conversation and travel topics.",
    updatedAt: "2m",
    unreadCount: 2,
  },
  {
    groupId: 2,
    title: "Study group",
    preview: "We need to finish the vocab list before tomorrow.",
    updatedAt: "10m",
  },
  {
    groupId: 3,
    title: "Friends room",
    preview: "Anyone free to chat tonight?",
    updatedAt: "1h",
  },
  {
    groupId: 4,
    title: "Work updates",
    preview: "The sprint review is moving to Friday.",
    updatedAt: "3h",
    unreadCount: 1,
  },
];

export function ChatShell({
  locale,
  dictionary,
  groupId,
}: {
  locale: Locale;
  dictionary: Dictionary;
  groupId: number;
}) {
  const conversations = useMemo(() => defaultConversations, []);

  return (
    <div className="mx-auto grid min-h-screen max-w-7xl gap-6 px-4 py-4 lg:grid-cols-[340px_1fr] lg:px-6">
      <ConversationSidebar
        dictionary={dictionary}
        conversations={conversations}
        activeGroupId={groupId}
      />
      <ChatRoom locale={locale} dictionary={dictionary} groupId={groupId} />
    </div>
  );
}
