import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/layout/site-header";
import { LandingHero } from "@/components/landing/landing-hero";
import { LandingFeatures } from "@/components/landing/landing-features";
import { getDictionary, getLocaleFromParams } from "@/i18n/get-dictionary";

export function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Metadata {
  const locale = getLocaleFromParams(params.locale);
  const dictionary = getDictionary(locale);

  return {
    title: dictionary.appName,
    description: dictionary.landing.description,
  };
}

export default function LocaleHomePage({
  params,
}: {
  params: { locale: string };
}) {
  const locale = getLocaleFromParams(params.locale);
  if (!["en", "vi"].includes(locale)) {
    notFound();
  }

  const dictionary = getDictionary(locale);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#1f2937_0%,_#09090b_45%,_#030712_100%)] text-white">
      <SiteHeader dictionary={dictionary} locale={locale} />
      <main>
        <LandingHero dictionary={dictionary} locale={locale} />
        <LandingFeatures dictionary={dictionary} />
      </main>
    </div>
  );
}

