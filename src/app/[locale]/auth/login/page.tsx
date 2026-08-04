import { notFound } from "next/navigation";
import { AuthCard } from "@/features/auth/components/auth-card";
import { AuthForm } from "@/features/auth/components/auth-form";
import { getDictionary, getLocaleFromParams } from "@/i18n/get-dictionary";

export default async function LoginPage({
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
    <>
      <AuthCard
        title={dictionary.auth.loginTitle}
        description={dictionary.auth.loginDescription}
        dictionary={dictionary}
        locale={locale}
        activeTab="login"
      >
        <AuthForm mode="login" dictionary={dictionary} locale={locale} />
      </AuthCard>
    </>
  );
}
