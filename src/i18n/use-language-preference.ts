"use client";

import { useSyncExternalStore } from "react";
import { dictionaries } from "./dictionaries";
import {
  DEFAULT_LOCALE,
  isLocale,
  LOCALE_COOKIE_MAX_AGE,
  LOCALE_COOKIE_NAME,
} from "./config";
import type { Dictionary, Locale } from "./types";

const OLD_LANGUAGE_STORAGE_KEY = "tiny-chat-language";
const LANGUAGE_STORAGE_KEY = "conyva-language";
export const LANGUAGE_CHANGED_EVENT = "conyva:language-changed";

export function getStoredLocale(): Locale {
  if (typeof window === "undefined") return DEFAULT_LOCALE;
  let storedLocale = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
  if (!storedLocale) {
    const legacyLocale = window.localStorage.getItem(OLD_LANGUAGE_STORAGE_KEY);
    if (legacyLocale) {
      storedLocale = legacyLocale;
      try {
        window.localStorage.setItem(LANGUAGE_STORAGE_KEY, legacyLocale);
        window.localStorage.removeItem(OLD_LANGUAGE_STORAGE_KEY);
      } catch {}
    }
  }
  return isLocale(storedLocale) ? storedLocale : DEFAULT_LOCALE;
}

export function persistLocale(locale: Locale) {
  window.localStorage.setItem(LANGUAGE_STORAGE_KEY, locale);
  document.cookie = `${LOCALE_COOKIE_NAME}=${locale}; Path=/; Max-Age=${LOCALE_COOKIE_MAX_AGE}; SameSite=Lax`;
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
    (): Locale => DEFAULT_LOCALE,
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
