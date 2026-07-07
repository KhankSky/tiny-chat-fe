import { en } from "./dictionaries/en";
import { vi } from "./dictionaries/vi";
import type { Dictionary, Locale } from "./types";

export const dictionaries: Record<Locale, Dictionary> = {
  en,
  vi,
};
