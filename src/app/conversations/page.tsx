"use client";

import { ConversationListPage } from "@/features/chat/components/conversation-list-page";
import { useLanguagePreference } from "@/i18n/use-language-preference";
import { useThemePreference } from "@/theme/use-theme-preference";

export default function ConversationsPage() {
  const { dictionary, locale, setLocale } = useLanguagePreference();
  const { setTheme, theme } = useThemePreference();
  return (
    <ConversationListPage
      locale={locale}
      dictionary={dictionary}
      onLocaleChange={setLocale}
      onThemeChange={setTheme}
      theme={theme}
    />
  );
}
