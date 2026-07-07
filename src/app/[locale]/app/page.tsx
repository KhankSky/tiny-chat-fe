import { redirect } from "next/navigation";

export default async function AppRedirectPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect(`/${locale}/conversations`);
}
