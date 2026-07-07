"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Locale } from "@/i18n/types";

const locales: Locale[] = ["en", "vi"];

export function LocaleSwitcher({ currentLocale }: { currentLocale: Locale }) {
  const pathname = usePathname();
  const nextLocale = currentLocale === "en" ? "vi" : "en";
  const segments = pathname.split("/");
  const nextPath = [``, nextLocale, ...segments.slice(2)].join("/");

  return (
    <Link
      href={nextPath}
      className="inline-flex h-10 items-center rounded-full border border-white/15 px-3 text-xs font-semibold tracking-[0.2em] text-white transition hover:bg-white/5"
      aria-label={`Switch language to ${nextLocale.toUpperCase()}`}
    >
      {locales.includes(currentLocale) ? nextLocale.toUpperCase() : "EN"}
    </Link>
  );
}

