"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export function AuthCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const isLogin = pathname?.includes("/login");

  return (
    <section className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl items-center px-6 py-10 lg:px-8">
      <div className="grid w-full gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-6 rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/20">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">
            Tiny Chat
          </p>
          <h1 className="max-w-md text-4xl font-semibold tracking-tight text-white">
            {title}
          </h1>
          <p className="max-w-lg text-sm leading-7 text-slate-300">
            {description}
          </p>

          <div className="flex gap-3">
            <Link
              href="/auth/login"
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                isLogin
                  ? "bg-cyan-400 text-slate-950"
                  : "border border-white/15 text-white hover:bg-white/5"
              }`}
            >
              Login
            </Link>
            <Link
              href="/auth/register"
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                !isLogin
                  ? "bg-cyan-400 text-slate-950"
                  : "border border-white/15 text-white hover:bg-white/5"
              }`}
            >
              Register
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

