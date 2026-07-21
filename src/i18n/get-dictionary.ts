import { dictionaries } from "./dictionaries";
import type { Dictionary, Locale } from "./types";

export const locales: Locale[] = ["en", "vi"];

export function getDictionary(locale: string | undefined): Dictionary {
  return dictionaries[getLocaleFromParams(locale)];
}

export function getLocaleFromParams(locale: string | undefined): Locale {
  return locales.includes(locale as Locale) ? (locale as Locale) : "vi";
}
