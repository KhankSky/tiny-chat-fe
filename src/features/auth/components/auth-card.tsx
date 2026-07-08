"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import type { Dictionary, Locale } from "@/i18n/types";

export function AuthCard({
  title,
  description,
  dictionary,
  activeTab,
  children,
}: {
  title: string;
  description: string;
  dictionary: Dictionary;
  locale?: Locale;
  activeTab: "login" | "register";
  children: ReactNode;
}) {
  return (
    <section className="mx-auto flex min-h-[calc(100dvh-5rem)] max-w-6xl items-center px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
      <div className="grid w-full gap-4 sm:gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-5 shadow-2xl shadow-black/20 sm:space-y-6 sm:rounded-[2rem] sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-cyan-300 sm:text-sm sm:tracking-[0.3em]">
            {dictionary.appName}
          </p>
          <h1 className="max-w-md text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            {title}
          </h1>
          <p className="max-w-lg text-sm leading-7 text-slate-300">
            {description}
          </p>

          <div className="flex gap-3">
            <Link
              href="/auth/login"
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                activeTab === "login"
                  ? "bg-cyan-400 text-slate-950"
                  : "border border-white/15 text-white hover:bg-white/5"
              }`}
            >
              {dictionary.header.login}
            </Link>
            <Link
              href="/auth/register"
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                activeTab === "register"
                  ? "bg-cyan-400 text-slate-950"
                  : "border border-white/15 text-white hover:bg-white/5"
              }`}
            >
              {dictionary.header.register}
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-4 shadow-2xl shadow-cyan-950/20 sm:rounded-[2rem] sm:p-6">
          {children}
        </div>
      </div>
    </section>
  );
}
