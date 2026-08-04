"use client";

import { Suspense } from "react";
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
        <Suspense fallback={null}>
          <AuthForm mode="login" dictionary={dictionary} locale={locale} />
        </Suspense>
      </AuthCard>
    </>
  );
}
