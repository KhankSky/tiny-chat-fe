import { dictionaries } from "./dictionaries";
import { DEFAULT_LOCALE, isLocale, supportedLocales } from "./config";
import type { Dictionary, Locale } from "./types";

export const locales: readonly Locale[] = supportedLocales;

export function getDictionary(locale: string | undefined): Dictionary {
  return dictionaries[getLocaleFromParams(locale)];
}

export function getLocaleFromParams(locale: string | undefined): Locale {
  return isLocale(locale) ? locale : DEFAULT_LOCALE;
}
