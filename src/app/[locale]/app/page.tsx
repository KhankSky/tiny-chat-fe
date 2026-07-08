import { redirect } from "next/navigation";

export default async function AppRedirectPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  await params;
  redirect("/conversations");
}
