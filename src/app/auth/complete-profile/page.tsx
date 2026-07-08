"use client";

import { CompleteProfileForm } from "@/features/auth/components/complete-profile-form";
import { useLanguagePreference } from "@/i18n/use-language-preference";

export default function CompleteProfilePage() {
  const { dictionary, locale } = useLanguagePreference();

  return (
    <main className="min-h-screen bg-[#070d18] px-4 py-8 text-white">
      <div className="mx-auto max-w-4xl rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 shadow-2xl shadow-black/30">
        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">
            {dictionary.appName}
          </p>
          <h1 className="mt-3 text-3xl font-semibold">{dictionary.auth.completeProfileTitle}</h1>
          <p className="mt-2 text-sm leading-7 text-slate-300">
            {dictionary.auth.completeProfileDescription}
          </p>
        </div>
        <CompleteProfileForm locale={locale} dictionary={dictionary} />
      </div>
    </main>
  );
}
