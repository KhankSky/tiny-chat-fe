"use client";

import { useSyncExternalStore } from "react";
import { dictionaries } from "./dictionaries";
import type { Dictionary, Locale } from "./types";

const LANGUAGE_STORAGE_KEY = "tiny-chat-language";
export const LANGUAGE_CHANGED_EVENT = "tiny-chat:language-changed";

export const supportedLocales: Locale[] = ["en", "vi"];

function isLocale(value: string | null): value is Locale {
  return supportedLocales.includes(value as Locale);
}

export function getStoredLocale(): Locale {
  if (typeof window === "undefined") return "en";
  const storedLocale = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
  return isLocale(storedLocale) ? storedLocale : "en";
}

export function persistLocale(locale: Locale) {
  window.localStorage.setItem(LANGUAGE_STORAGE_KEY, locale);
  window.dispatchEvent(new CustomEvent(LANGUAGE_CHANGED_EVENT, { detail: locale }));
}

export function useLanguagePreference(): {
  dictionary: Dictionary;
  locale: Locale;
  setLocale: (locale: Locale) => void;
} {
  const locale = useSyncExternalStore(
    (onStoreChange) => {
      if (typeof window === "undefined") {
        return () => {};
      }

      function handleLanguageChanged(event: Event) {
        const nextLocale = (event as CustomEvent<Locale>).detail;
        if (isLocale(nextLocale)) {
          onStoreChange();
        }
      }

      window.addEventListener(LANGUAGE_CHANGED_EVENT, handleLanguageChanged);
      return () => {
        window.removeEventListener(LANGUAGE_CHANGED_EVENT, handleLanguageChanged);
      };
    },
    getStoredLocale,
    (): Locale => "en",
  );

  function setLocale(nextLocale: Locale) {
    persistLocale(nextLocale);
  }

  return {
    dictionary: dictionaries[locale],
    locale,
    setLocale,
  };
}
