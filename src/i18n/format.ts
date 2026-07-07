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

export function formatConversationTime(value: string | null | undefined, locale: Locale) {
  if (!value) return "";

  const date = new Date(value);
  const now = new Date();
  const sameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  if (sameDay) {
    return new Intl.DateTimeFormat(dateTimeLocales[locale], {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  }

  if (date.getFullYear() === now.getFullYear()) {
    return new Intl.DateTimeFormat(dateTimeLocales[locale], {
      day: "2-digit",
      month: "2-digit",
    }).format(date);
  }

  return new Intl.DateTimeFormat(dateTimeLocales[locale], {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  }).format(date);
}
