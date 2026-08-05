import { notFound } from "next/navigation";
import { ConversationListPage } from "@/features/chat/components/conversation-list-page";
import { isLocale } from "@/i18n/config";
import { getDictionary, getLocaleFromParams } from "@/i18n/get-dictionary";

export default async function ConversationsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale = getLocaleFromParams(rawLocale);

  return (
    <ConversationListPage
      locale={locale}
      dictionary={getDictionary(locale)}
    />
  );
}
