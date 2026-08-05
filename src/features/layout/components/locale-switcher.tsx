"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { persistLocale } from "@/i18n/use-language-preference";
import { supportedLocales } from "@/i18n/config";
import type { Locale } from "@/i18n/types";

export function LocaleSwitcher({ currentLocale }: { currentLocale: Locale }) {
  const pathname = usePathname();
  const segments = pathname.split("/");

  return (
    <div className="flex items-center gap-1">
      {supportedLocales
        .filter((locale) => locale !== currentLocale)
        .map((nextLocale) => {
          const nextPath = ["", nextLocale, ...segments.slice(2)].join("/");

          return (
            <Link
              key={nextLocale}
              href={nextPath}
              onClick={() => persistLocale(nextLocale)}
              className="inline-flex h-10 items-center rounded-full border border-white/15 px-3 text-xs font-semibold tracking-[0.2em] text-white transition hover:bg-white/5"
              aria-label={`Switch language to ${nextLocale.toUpperCase()}`}
            >
              {nextLocale.toUpperCase()}
            </Link>
          );
        })}
    </div>
  );
}
