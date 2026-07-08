"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import { ConversationThreadPage } from "@/features/chat/components/conversation-thread-page";
import { useLanguagePreference } from "@/i18n/use-language-preference";
import { useThemePreference } from "@/theme/use-theme-preference";

export default function ConversationThreadRoute({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const { conversationId: rawConversationId } = use(params);
  const conversationId = Number(rawConversationId);
  const { dictionary, locale, setLocale } = useLanguagePreference();
  const { setTheme, theme } = useThemePreference();

  if (!Number.isFinite(conversationId)) {
    notFound();
  }

  return (
    <ConversationThreadPage
      locale={locale}
      conversationId={conversationId}
      dictionary={dictionary}
      onLocaleChange={setLocale}
      onThemeChange={setTheme}
      theme={theme}
    />
  );
}
