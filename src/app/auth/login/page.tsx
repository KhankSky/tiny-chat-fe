"use client";

import { AuthCard } from "@/features/auth/components/auth-card";
import { AuthForm } from "@/features/auth/components/auth-form";
import { SessionRedirect } from "@/features/auth/components/session-redirect";
import { useLanguagePreference } from "@/i18n/use-language-preference";

export default function LoginPage() {
  const { dictionary, locale } = useLanguagePreference();

  return (
    <>
      <SessionRedirect />
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
