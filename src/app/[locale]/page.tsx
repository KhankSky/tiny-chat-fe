import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/features/layout/components/site-header";
import { LandingHero } from "@/features/landing/components/landing-hero";
import { LandingFeatures } from "@/features/landing/components/landing-features";
import { LandingStructuredData } from "@/features/landing/components/landing-structured-data";
import { isLocale, supportedLocales } from "@/i18n/config";
import { getDictionary, getLocaleFromParams } from "@/i18n/get-dictionary";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale = getLocaleFromParams(rawLocale);
  const dictionary = getDictionary(locale);
  const localePath = `/${locale}`;

  return {
    title: { absolute: dictionary.seo.homeTitle },
    description: dictionary.landing.description,
    alternates: {
      canonical: localePath,
      languages: Object.fromEntries(
        [
          ...supportedLocales.map((supportedLocale) => [
            supportedLocale,
            `/${supportedLocale}`,
          ]),
          ["x-default", "/"],
        ],
      ),
    },
    openGraph: {
      title: dictionary.seo.homeTitle,
      description: dictionary.landing.description,
      url: localePath,
      locale: locale === "vi" ? "vi_VN" : "en_US",
      alternateLocale: locale === "vi" ? "en_US" : "vi_VN",
      siteName: "Conyva",
      type: "website",
      images: [
        {
          url: `/${locale}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: dictionary.seo.socialImageAlt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: dictionary.seo.homeTitle,
      description: dictionary.landing.description,
      images: [`/${locale}/twitter-image`],
    },
    robots: { index: true, follow: true },
  };
}

export default async function LocaleHomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale = getLocaleFromParams(rawLocale);

  const dictionary = getDictionary(locale);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#1f2937_0%,_#09090b_45%,_#030712_100%)] text-white">
      <LandingStructuredData locale={locale} />
      <SiteHeader dictionary={dictionary} locale={locale} />
      <main>
        <LandingHero dictionary={dictionary} locale={locale} />
        <LandingFeatures dictionary={dictionary} />
      </main>
    </div>
  );
}
