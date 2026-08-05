export const supportedLocales = ["en", "vi"] as const;

export type Locale = (typeof supportedLocales)[number];

export const DEFAULT_LOCALE: Locale = "vi";
export const LOCALE_COOKIE_NAME = "conyva_locale";
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export function isLocale(value: string | null | undefined): value is Locale {
  return supportedLocales.includes(value as Locale);
}

export function getPreferredLocale(acceptLanguage: string | null): Locale {
  if (!acceptLanguage) return DEFAULT_LOCALE;

  const requestedLocales = acceptLanguage
    .split(",")
    .map((part) => part.trim().split(";")[0]?.toLowerCase())
    .filter((locale): locale is string => Boolean(locale));

  for (const requestedLocale of requestedLocales) {
    const exactMatch = supportedLocales.find((locale) => locale === requestedLocale);
    if (exactMatch) return exactMatch;

    const languageMatch = requestedLocale.split("-")[0];
    if (isLocale(languageMatch)) return languageMatch;
  }

  return DEFAULT_LOCALE;
}
