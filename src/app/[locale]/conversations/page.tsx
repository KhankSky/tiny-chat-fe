import { notFound } from "next/navigation";
import { ConversationListPage } from "@/features/chat/components/conversation-list-page";
import { getLocaleFromParams } from "@/i18n/get-dictionary";

export default async function ConversationsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = getLocaleFromParams(rawLocale);
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
