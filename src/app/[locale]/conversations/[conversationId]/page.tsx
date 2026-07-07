import { notFound } from "next/navigation";
import { ConversationThreadPage } from "@/features/chat/components/conversation-thread-page";
import { getLocaleFromParams } from "@/i18n/get-dictionary";

export default async function ConversationThreadRoute({
  params,
}: {
  params: Promise<{ locale: string; conversationId: string }>;
}) {
  const { locale: rawLocale, conversationId: rawConversationId } = await params;
  const locale = getLocaleFromParams(rawLocale);
  if (!["en", "vi"].includes(locale)) {
    notFound();
  }

  const conversationId = Number(rawConversationId);
  if (Number.isNaN(conversationId)) {
    notFound();
  }

  return (
    <ConversationThreadPage
      locale={locale}
      conversationId={conversationId}
    />
  );
}
