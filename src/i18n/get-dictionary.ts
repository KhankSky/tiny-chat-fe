import { dictionaries } from "./dictionaries";
import type { Dictionary, Locale } from "./types";

export function getDictionary(locale: string | undefined): Dictionary {
  if (locale === "vi") {
    return dictionaries.vi;
  }

  return dictionaries.en;
}

export function getLocaleFromParams(locale: string | undefined): Locale {
  return locale === "vi" ? "vi" : "en";
}

