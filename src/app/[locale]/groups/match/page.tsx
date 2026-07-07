import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GroupMatchingPage } from "@/components/groups/group-matching-page";
import { getDictionary, getLocaleFromParams } from "@/i18n/get-dictionary";

export function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Metadata {
  const locale = getLocaleFromParams(params.locale);
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

export default function GroupMatchRoute({
  params,
}: {
  params: { locale: string };
}) {
  const locale = getLocaleFromParams(params.locale);
  if (!["en", "vi"].includes(locale)) {
    notFound();
  }

  return <GroupMatchingPage locale={locale} />;
}
