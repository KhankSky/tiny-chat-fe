import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AuthCard } from "@/features/auth/components/auth-card";
import { AuthForm } from "@/features/auth/components/auth-form";
import { isLocale } from "@/i18n/config";
import { getDictionary, getLocaleFromParams } from "@/i18n/get-dictionary";

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale = getLocaleFromParams(rawLocale);

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
        <Suspense fallback={null}>
          <AuthForm mode="login" dictionary={dictionary} locale={locale} />
        </Suspense>
      </AuthCard>
    </>
  );
}
