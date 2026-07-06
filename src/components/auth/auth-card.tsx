"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import type { Dictionary, Locale } from "@/i18n/types";

export function AuthCard({
  title,
  description,
  dictionary,
  locale,
  activeTab,
  children,
}: {
  title: string;
  description: string;
  dictionary: Dictionary;
  locale: Locale;
  activeTab: "login" | "register";
  children: ReactNode;
}) {
  return (
    <section className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl items-center px-6 py-10 lg:px-8">
      <div className="grid w-full gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-6 rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/20">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">
            {dictionary.appName}
          </p>
          <h1 className="max-w-md text-4xl font-semibold tracking-tight text-white">
            {title}
          </h1>
          <p className="max-w-lg text-sm leading-7 text-slate-300">
            {description}
          </p>

          <div className="flex gap-3">
            <Link
              href={`/${locale}/auth/login`}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                activeTab === "login"
                  ? "bg-cyan-400 text-slate-950"
                  : "border border-white/15 text-white hover:bg-white/5"
              }`}
            >
              {dictionary.header.login}
            </Link>
            <Link
              href={`/${locale}/auth/register`}
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

        <div className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 shadow-2xl shadow-cyan-950/20">
          {children}
        </div>
      </div>
    </section>
  );
}
