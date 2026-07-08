"use client";

import { ProfilePage } from "@/features/profile/components/profile-page";
import { useLanguagePreference } from "@/i18n/use-language-preference";

export default function ProfileRoute() {
  const { dictionary, locale, setLocale } = useLanguagePreference();
  return <ProfilePage locale={locale} dictionary={dictionary} onLocaleChange={setLocale} />;
}
