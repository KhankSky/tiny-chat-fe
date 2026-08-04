"use client";

import { Suspense } from "react";
import { AuthCard } from "@/features/auth/components/auth-card";
import { AuthForm } from "@/features/auth/components/auth-form";
import { useLanguagePreference } from "@/i18n/use-language-preference";

export default function RegisterPage() {
  const { dictionary, locale } = useLanguagePreference();

  return (
    <AuthCard
        title={dictionary.auth.registerTitle}
        description={dictionary.auth.registerDescription}
        dictionary={dictionary}
        locale={locale}
        activeTab="register"
      >
        <Suspense fallback={null}>
          <AuthForm mode="register" dictionary={dictionary} locale={locale} />
        </Suspense>
    </AuthCard>
  );
}
