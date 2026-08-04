"use client";

import { AuthCard } from "@/features/auth/components/auth-card";
import { AuthForm } from "@/features/auth/components/auth-form";
import { useLanguagePreference } from "@/i18n/use-language-preference";

export default function LoginPage() {
  const { dictionary, locale } = useLanguagePreference();

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
