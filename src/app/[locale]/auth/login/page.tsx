import { notFound } from "next/navigation";
import { AuthCard } from "@/components/auth/auth-card";
import { AuthForm } from "@/components/auth/auth-form";
import { getDictionary, getLocaleFromParams } from "@/i18n/get-dictionary";

export default function LoginPage({
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
      title={dictionary.auth.loginTitle}
      description={dictionary.auth.loginDescription}
      dictionary={dictionary}
      locale={locale}
      activeTab="login"
    >
      <AuthForm mode="login" dictionary={dictionary} locale={locale} />
    </AuthCard>
  );
}

