import { redirect } from "next/navigation";

export default function AppRedirectPage({
  params,
}: {
  params: { locale: string };
}) {
  redirect(`/${params.locale}/conversations`);
}
