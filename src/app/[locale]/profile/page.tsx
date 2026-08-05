import { notFound } from "next/navigation";
import { ProfilePage } from "@/features/profile/components/profile-page";
import { isLocale } from "@/i18n/config";
import { getDictionary, getLocaleFromParams } from "@/i18n/get-dictionary";

export default async function ProfileRoute({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale = getLocaleFromParams(rawLocale);

  return <ProfilePage locale={locale} dictionary={getDictionary(locale)} />;
}
