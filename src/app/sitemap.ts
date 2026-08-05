import type { MetadataRoute } from "next";
import { supportedLocales } from "@/i18n/config";

const productionUrl = "https://conyva.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const alternates = Object.fromEntries(
    [
      ...supportedLocales.map((locale) => [locale, `${productionUrl}/${locale}`]),
      ["x-default", productionUrl],
    ],
  );

  return supportedLocales.map((locale) => ({
    url: `${productionUrl}/${locale}`,
    changeFrequency: "weekly",
    priority: 1,
    alternates: { languages: alternates },
  }));
}
