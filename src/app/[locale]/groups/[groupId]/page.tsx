import { redirect } from "next/navigation";

export default async function GroupRedirectPage({
  params,
}: {
  params: Promise<{ locale: string; groupId: string }>;
}) {
  const { locale, groupId } = await params;
  redirect(`/${locale}/conversations/${groupId}`);
}
