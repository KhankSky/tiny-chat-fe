import { notFound } from "next/navigation";
import { ConversationListPage } from "@/features/chat/components/conversation-list-page";
import { getDictionary, getLocaleFromParams } from "@/i18n/get-dictionary";

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
      dictionary={getDictionary(locale)}
    />
  );
}
