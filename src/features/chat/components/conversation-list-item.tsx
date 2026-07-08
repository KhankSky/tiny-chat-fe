import Link from "next/link";
import type { ConversationResponse } from "@/features/chat/types";
import { formatDateTime } from "@/i18n/format";
import type { Locale } from "@/i18n/types";

export function ConversationListItem({
  conversation,
  locale,
  noMessages,
}: {
  conversation: ConversationResponse;
  locale: Locale;
  noMessages: string;
}) {
  return (
    <Link
      href={`/conversations/${conversation.conversationId}`}
      className="block rounded-3xl border border-transparent p-4 transition hover:border-white/10 hover:bg-white/5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">{conversation.title}</p>
          <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-400">
            {conversation.lastMessage || conversation.description || noMessages}
          </p>
        </div>
        <span className="shrink-0 rounded-full border border-white/10 px-2 py-1 text-xs text-slate-400">
          {conversation.memberCount}
        </span>
      </div>
      <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
        <span>#{conversation.conversationId}</span>
        <span>{formatDateTime(conversation.lastMessageAt, locale)}</span>
      </div>
    </Link>
  );
}
