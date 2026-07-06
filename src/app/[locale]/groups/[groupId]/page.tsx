import { redirect } from "next/navigation";

export default function GroupRedirectPage({
  params,
}: {
  params: { locale: string; groupId: string };
}) {
  redirect(`/${params.locale}/conversations/${params.groupId}`);
}

