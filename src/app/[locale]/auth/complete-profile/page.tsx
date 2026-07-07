import { notFound } from "next/navigation";
import { CompleteProfileForm } from "@/features/auth/components/complete-profile-form";
import { getDictionary, getLocaleFromParams } from "@/i18n/get-dictionary";

export default async function CompleteProfilePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = getLocaleFromParams(rawLocale);
  if (!["en", "vi"].includes(locale)) {
    notFound();
  }

  const dictionary = getDictionary(locale);

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl items-center px-6 py-12 text-white">
      <div className="grid w-full gap-8 lg:grid-cols-[0.8fr_1.2fr]">
        <section className="space-y-5 rounded-lg border border-white/10 bg-white/5 p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">
            {dictionary.appName}
          </p>
          <h1 className="text-3xl font-semibold">
            {dictionary.auth.completeProfileTitle}
          </h1>
          <p className="text-sm leading-7 text-slate-300">
            {dictionary.auth.completeProfileDescription}
          </p>
        </section>

        <section className="rounded-lg border border-white/10 bg-slate-950/85 p-6">
          <CompleteProfileForm locale={locale} dictionary={dictionary} />
        </section>
      </div>
    </main>
  );
}
