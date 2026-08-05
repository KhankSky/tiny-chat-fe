"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import type { Dictionary, Locale } from "@/i18n/types";
import { getStoredAuthUser, subscribeAuthSession } from "@/shared/auth/session";
import { LocaleSwitcher } from "./locale-switcher";

export function SiteHeader({
  dictionary,
  locale,
}: {
  dictionary: Dictionary;
  locale?: Locale;
}) {
  const currentUser = useSyncExternalStore(
    subscribeAuthSession,
    getStoredAuthUser,
    () => null,
  );
  const chatHref = locale ? `/${locale}/conversations` : "/conversations";
  const localePrefix = locale ? `/${locale}` : "";

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/75 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4 lg:px-8">
        <Link href={locale ? `/${locale}` : "/"} className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-cyan-400/15 text-sm font-semibold text-cyan-300 ring-1 ring-inset ring-cyan-400/30">
            C
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold tracking-wide text-white">
              {dictionary.appName}
            </p>
            <p className="hidden text-xs text-slate-400 sm:block">{dictionary.appTagline}</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 text-sm text-slate-300 md:flex">
          {dictionary.header.nav.filter((item) => item.href !== "#contact").map((item) => (
            <a key={item.label} href={item.href} className="transition hover:text-white">
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {locale ? <LocaleSwitcher currentLocale={locale} /> : null}
          {currentUser ? (
            <Link
              href={chatHref}
              className="inline-flex min-h-10 items-center rounded-full bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
            >
              {dictionary.header.backToChat}
            </Link>
          ) : (
            <>
              <Link href={`${localePrefix}/auth/login`} className="hidden rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-white transition hover:border-white/30 hover:bg-white/5 sm:inline-flex">
                {dictionary.header.login}
              </Link>
              <Link href={`${localePrefix}/auth/register`} className="inline-flex min-h-10 items-center rounded-full bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300">
                {dictionary.header.register}
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
