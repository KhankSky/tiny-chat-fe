import { notFound } from "next/navigation";
import { AuthCard } from "@/components/auth/auth-card";
import { AuthForm } from "@/components/auth/auth-form";
import { getDictionary, getLocaleFromParams } from "@/i18n/get-dictionary";

export default function RegisterPage({
  params,
}: {
  params: { locale: string };
}) {
  const locale = getLocaleFromParams(params.locale);
  if (!["en", "vi"].includes(locale)) {
    notFound();
  }

  const dictionary = getDictionary(locale);

  return (
    <AuthCard
      title={dictionary.auth.registerTitle}
      description={dictionary.auth.registerDescription}
      dictionary={dictionary}
      locale={locale}
      activeTab="register"
    >
      <AuthForm mode="register" dictionary={dictionary} locale={locale} />
    </AuthCard>
  );
}

