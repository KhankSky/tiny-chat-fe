import { notFound } from "next/navigation";
import { ConversationListPage } from "@/components/chat/conversation-list-page";
import { getLocaleFromParams } from "@/i18n/get-dictionary";

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
      title={locale === "vi" ? "Doan chat" : "Messages"}
      description={
        locale === "vi"
          ? "Chon mot cuoc hoi thoai de vao nhan tin."
          : "Pick a conversation to start chatting."
      }
    />
  );
}
