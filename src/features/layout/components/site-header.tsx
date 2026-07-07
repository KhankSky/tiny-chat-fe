import Link from "next/link";
import type { Dictionary, Locale } from "@/i18n/types";
import { LocaleSwitcher } from "./locale-switcher";

export function SiteHeader({
  dictionary,
  locale,
}: {
  dictionary: Dictionary;
  locale: Locale;
}) {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/75 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 lg:px-8">
        <Link href={`/${locale}`} className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-400/15 text-sm font-semibold text-cyan-300 ring-1 ring-inset ring-cyan-400/30">
            TC
          </span>
          <div>
            <p className="text-sm font-semibold tracking-wide text-white">
              {dictionary.appName}
            </p>
            <p className="text-xs text-slate-400">{dictionary.appTagline}</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 text-sm text-slate-300 md:flex">
          {dictionary.header.nav.map((item) => (
            <a key={item.label} href={item.href} className="transition hover:text-white">
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <LocaleSwitcher currentLocale={locale} />
          <Link
            href={`/${locale}/auth/login`}
            className="rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-white transition hover:border-white/30 hover:bg-white/5"
          >
            {dictionary.header.login}
          </Link>
          <Link
            href={`/${locale}/auth/register`}
            className="rounded-full bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
          >
            {dictionary.header.register}
          </Link>
        </div>
      </div>
    </header>
  );
}
