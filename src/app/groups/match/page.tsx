"use client";

import { GroupMatchingPage } from "@/features/groups/components/group-matching-page";
import { useLanguagePreference } from "@/i18n/use-language-preference";

export default function GroupsMatchPage() {
  const { dictionary, locale } = useLanguagePreference();
  return <GroupMatchingPage locale={locale} dictionary={dictionary} />;
}
