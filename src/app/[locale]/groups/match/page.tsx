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
    title: dictionary.groups.metadataTitle,
    description: dictionary.groups.metadataDescription,
    openGraph: {
      title: `${dictionary.appName} | ${dictionary.groups.metadataTitle}`,
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

  return <GroupMatchingPage locale={locale} dictionary={getDictionary(locale)} />;
}
