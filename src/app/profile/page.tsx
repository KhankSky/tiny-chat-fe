"use client";

import { ProfilePage } from "@/features/profile/components/profile-page";
import { useLanguagePreference } from "@/i18n/use-language-preference";
import { useThemePreference } from "@/theme/use-theme-preference";

export default function ProfileRoute() {
  const { dictionary, locale, setLocale } = useLanguagePreference();
  const { setTheme, theme } = useThemePreference();
  return (
    <ProfilePage
      locale={locale}
      dictionary={dictionary}
      onLocaleChange={setLocale}
      theme={theme}
      onThemeChange={setTheme}
    />
  );
}
