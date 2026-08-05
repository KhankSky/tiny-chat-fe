import { notFound } from "next/navigation";
import { ConversationThreadPage } from "@/features/chat/components/conversation-thread-page";
import { isLocale } from "@/i18n/config";
import { getDictionary, getLocaleFromParams } from "@/i18n/get-dictionary";

export default async function ConversationThreadRoute({
  params,
}: {
  params: Promise<{ locale: string; conversationId: string }>;
}) {
  const { locale: rawLocale, conversationId: rawConversationId } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale = getLocaleFromParams(rawLocale);

  const conversationId = Number(rawConversationId);
  if (Number.isNaN(conversationId)) {
    notFound();
  }

  return (
    <ConversationThreadPage
      locale={locale}
      conversationId={conversationId}
      dictionary={getDictionary(locale)}
    />
  );
}
