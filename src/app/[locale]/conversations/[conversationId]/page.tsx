import { notFound } from "next/navigation";
import { ConversationThreadPage } from "@/components/chat/conversation-thread-page";
import { getLocaleFromParams } from "@/i18n/get-dictionary";

export default function ConversationThreadRoute({
  params,
}: {
  params: { locale: string; conversationId: string };
}) {
  const locale = getLocaleFromParams(params.locale);
  if (!["en", "vi"].includes(locale)) {
    notFound();
  }

  const conversationId = Number(params.conversationId);
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
