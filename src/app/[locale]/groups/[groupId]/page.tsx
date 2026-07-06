import { notFound } from "next/navigation";
import { ChatShell } from "@/components/chat/chat-shell";
import { getDictionary, getLocaleFromParams } from "@/i18n/get-dictionary";

export default function GroupChatPage({
  params,
}: {
  params: { locale: string; groupId: string };
}) {
  const locale = getLocaleFromParams(params.locale);
  if (!["en", "vi"].includes(locale)) {
    notFound();
  }

  const groupId = Number(params.groupId);
  if (Number.isNaN(groupId)) {
    notFound();
  }

  const dictionary = getDictionary(locale);

  return <ChatShell locale={locale} dictionary={dictionary} groupId={groupId} />;
}
