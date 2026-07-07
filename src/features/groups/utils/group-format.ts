import { formatDateTime } from "@/i18n/format";
import type { Dictionary, Locale } from "@/i18n/types";

export function formatGroupLabel(value: string | null | undefined, dictionary: Dictionary) {
  if (!value) return null;

  const labels: Record<string, string> = {
    ...dictionary.enums.englishLevel,
    ...dictionary.enums.practiceGoal,
    ...dictionary.enums.interest,
  };

  return (
    labels[value] ||
    value
      .split("_")
      .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
      .join(" ")
  );
}

export function formatJoinedAt(joinedAt: string | null, locale: Locale) {
  return formatDateTime(joinedAt, locale);
}
