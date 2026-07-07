import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GroupMatchingPage } from "@/features/groups/components/group-matching-page";
import { getDictionary, getLocaleFromParams } from "@/i18n/get-dictionary";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = getLocaleFromParams(rawLocale);
  const dictionary = getDictionary(locale);

  return {
    title: locale === "vi" ? "Tìm nhóm" : "Find a group",
    description:
      locale === "vi"
        ? "Ghép vào nhóm nhỏ phù hợp theo trình độ, mục tiêu và sở thích."
        : "Match into a small group based on level, goals, and interests.",
    openGraph: {
      title: `${dictionary.appName} | ${locale === "vi" ? "Tìm nhóm" : "Find a group"}`,
    },
  };
}

export default async function GroupMatchRoute({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = getLocaleFromParams(rawLocale);
  if (!["en", "vi"].includes(locale)) {
    notFound();
  }

  return <GroupMatchingPage locale={locale} />;
}
