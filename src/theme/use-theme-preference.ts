"use client";

import { useEffect, useState } from "react";

const THEME_STORAGE_KEY = "tiny-chat-theme";
export const THEME_CHANGED_EVENT = "tiny-chat:theme-changed";

export type ThemeMode = "dark" | "light";

export const supportedThemes: ThemeMode[] = ["dark", "light"];

function isThemeMode(value: string | null): value is ThemeMode {
  return supportedThemes.includes(value as ThemeMode);
}

export function getStoredTheme(): ThemeMode {
  if (typeof window === "undefined") return "dark";
  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
  return isThemeMode(storedTheme) ? storedTheme : "dark";
}

function applyTheme(theme: ThemeMode) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
}

export function persistTheme(theme: ThemeMode) {
  window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  applyTheme(theme);
  window.dispatchEvent(new CustomEvent(THEME_CHANGED_EVENT, { detail: theme }));
}

export function useThemePreference(): {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
} {
  const [theme, setThemeState] = useState<ThemeMode>(() => getStoredTheme());

  useEffect(() => {
    applyTheme(theme);

    function handleThemeChanged(event: Event) {
      const nextTheme = (event as CustomEvent<ThemeMode>).detail;
      if (isThemeMode(nextTheme)) {
        applyTheme(nextTheme);
        setThemeState(nextTheme);
      }
    }

    window.addEventListener(THEME_CHANGED_EVENT, handleThemeChanged);
    return () => {
      window.removeEventListener(THEME_CHANGED_EVENT, handleThemeChanged);
    };
  }, [theme]);

  function setTheme(nextTheme: ThemeMode) {
    persistTheme(nextTheme);
    setThemeState(nextTheme);
  }

  return {
    theme,
    setTheme,
  };
}
