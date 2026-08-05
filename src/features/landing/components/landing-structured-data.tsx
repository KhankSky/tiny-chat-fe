import type { Locale } from "@/i18n/types";
import { getDictionary } from "@/i18n/get-dictionary";

const siteUrl = "https://conyva.app";

export function LandingStructuredData({ locale }: { locale: Locale }) {
  const dictionary = getDictionary(locale);
  const pageUrl = `${siteUrl}/${locale}`;
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        name: dictionary.appName,
        url: siteUrl,
        inLanguage: locale,
      },
      {
        "@type": "SoftwareApplication",
        name: dictionary.appName,
        applicationCategory: "EducationalApplication",
        operatingSystem: "Web",
        url: pageUrl,
        inLanguage: locale,
        description: dictionary.landing.description,
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
      }}
    />
  );
}
