import Link from "next/link";
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
      <div className="w-full rounded-[2rem] border border-white/10 bg-white/5 p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">
          {dictionary.appName}
        </p>
        <h1 className="mt-4 text-3xl font-semibold">
          {locale === "vi" ? "Vào phòng chat nhóm" : "Join a group chat room"}
        </h1>
        <p className="mt-3 text-sm leading-7 text-slate-300">
          {locale === "vi"
            ? "Nhập group ID để vào phòng chat hiện có."
            : "Enter a group ID to open an existing room."}
        </p>

        <form
          className="mt-6 flex gap-3"
          action={`/${locale}/groups/1`}
        >
          <input
            name="groupId"
            defaultValue="1"
            className="min-h-12 flex-1 rounded-full border border-white/10 bg-slate-950/80 px-5 text-white outline-none"
            placeholder="1"
          />
          <Link
            href={`/${locale}/groups/1`}
            className="inline-flex items-center justify-center rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
          >
            {locale === "vi" ? "Vào phòng" : "Open room"}
          </Link>
        </form>
      </div>
    </main>
  );
}

