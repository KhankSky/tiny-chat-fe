"use client";

import { ConversationListPage } from "@/features/chat/components/conversation-list-page";
import { useLanguagePreference } from "@/i18n/use-language-preference";

export default function ConversationsPage() {
  const { dictionary, locale, setLocale } = useLanguagePreference();
  return (
    <ConversationListPage
      locale={locale}
      dictionary={dictionary}
      onLocaleChange={setLocale}
    />
  );
}
