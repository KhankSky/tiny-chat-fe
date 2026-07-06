import { notFound } from "next/navigation";
import { ConversationListPage } from "@/components/chat/conversation-list-page";
import type { ConversationItem } from "@/components/chat/conversation-sidebar";
import { getLocaleFromParams } from "@/i18n/get-dictionary";

const inboxConversations: ConversationItem[] = [
  {
    groupId: 1,
    title: "English practice",
    preview: "Let’s continue with daily conversation and travel topics.",
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

export default function ConversationsPage({
  params,
}: {
  params: { locale: string };
}) {
  const locale = getLocaleFromParams(params.locale);
  if (!["en", "vi"].includes(locale)) {
    notFound();
  }

  return (
    <ConversationListPage
      locale={locale}
      title={locale === "vi" ? "Đoạn chat" : "Messages"}
      description={
        locale === "vi"
          ? "Chọn một cuộc hội thoại để vào nhắn tin."
          : "Pick a conversation to start chatting."
      }
      conversations={inboxConversations}
    />
  );
}
