import type { Locale } from "./types";

const dateTimeLocales: Record<Locale, string> = {
  en: "en-US",
  vi: "vi-VN",
};

export function formatDateTime(value: string | null | undefined, locale: Locale) {
  if (!value) return "";
  return new Intl.DateTimeFormat(dateTimeLocales[locale], {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
