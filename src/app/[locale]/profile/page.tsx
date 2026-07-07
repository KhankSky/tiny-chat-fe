import { notFound } from "next/navigation";
import { ProfilePage } from "@/features/profile/components/profile-page";
import { getDictionary, getLocaleFromParams } from "@/i18n/get-dictionary";

export default async function ProfileRoute({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = getLocaleFromParams(rawLocale);
  if (!["en", "vi"].includes(locale)) {
    notFound();
  }

  return <ProfilePage locale={locale} dictionary={getDictionary(locale)} />;
}
