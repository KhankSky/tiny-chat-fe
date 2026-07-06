import { notFound } from "next/navigation";
import { getDictionary, getLocaleFromParams } from "@/i18n/get-dictionary";

export default function AppHomePage({
  params,
}: {
  params: { locale: string };
}) {
  const locale = getLocaleFromParams(params.locale);
  if (!["en", "vi"].includes(locale)) {
    notFound();
  }

  const dictionary = getDictionary(locale);

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl items-center px-6 py-16 text-white">
      <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">
          {dictionary.appName}
        </p>
        <h1 className="mt-4 text-3xl font-semibold">Main app shell placeholder</h1>
        <p className="mt-3 text-sm leading-7 text-slate-300">
          This is the next screen after auth. We can build the chat workspace
          here while keeping language support intact.
        </p>
      </div>
    </main>
  );
}

