import { notFound } from "next/navigation";
import { AuthCard } from "@/components/auth/auth-card";
import { AuthForm } from "@/components/auth/auth-form";
import { SessionRedirect } from "@/components/auth/session-redirect";
import { getDictionary, getLocaleFromParams } from "@/i18n/get-dictionary";

export default async function RegisterPage({
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
      <SessionRedirect locale={locale} />
      <AuthCard
        title={dictionary.auth.registerTitle}
        description={dictionary.auth.registerDescription}
        dictionary={dictionary}
        locale={locale}
        activeTab="register"
      >
        <AuthForm mode="register" dictionary={dictionary} locale={locale} />
      </AuthCard>
    </>
  );
}
