"use client";

import { useEffect } from "react";
import { getStoredTheme } from "./use-theme-preference";

export function ThemeInitializer() {
  useEffect(() => {
    const theme = getStoredTheme();
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  }, []);

  return null;
}
