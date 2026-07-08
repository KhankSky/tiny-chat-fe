"use client";

import { LandingFeatures } from "@/features/landing/components/landing-features";
import { LandingHero } from "@/features/landing/components/landing-hero";
import { SiteHeader } from "@/features/layout/components/site-header";
import { useLanguagePreference } from "@/i18n/use-language-preference";

export default function RootPage() {
  const { dictionary, locale } = useLanguagePreference();

  return (
    <>
      <SiteHeader dictionary={dictionary} locale={locale} />
      <main>
        <LandingHero dictionary={dictionary} locale={locale} />
        <LandingFeatures dictionary={dictionary} />
      </main>
    </>
  );
}
