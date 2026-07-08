"use client";

import { useConversations } from "@/features/chat/hooks/use-conversations";
import { ProfileEditorModal } from "@/features/profile/components/profile-editor-modal";
import { useProfileEditor } from "@/features/profile/hooks/use-profile-editor";
import type { Dictionary, Locale } from "@/i18n/types";
import { ChatRoom } from "./chat-room";
import { ConversationSidebar } from "./conversation-sidebar";
import { GroupSidebar } from "./group-sidebar";

export function ConversationThreadPage({
  locale,
  dictionary,
  conversationId,
}: {
  locale: Locale;
  dictionary: Dictionary;
  conversationId: number;
}) {
  const conversations = useConversations({ dictionary, locale });
  const profileEditor = useProfileEditor(dictionary);

  return (
    <div className="h-screen w-full overflow-hidden bg-[#070d18] text-white">
      <div
        className="grid h-full min-h-0 w-full lg:grid-cols-[340px_minmax(0,1fr)_360px]"
      >
        <ConversationSidebar
          locale={locale}
          dictionary={dictionary}
          conversations={conversations}
          activeGroupId={conversationId}
          currentUser={profileEditor.currentUser}
          onEditProfile={profileEditor.openProfileEditor}
        />
        <ChatRoom
          key={`chat-${conversationId}`}
          locale={locale}
          dictionary={dictionary}
          groupId={conversationId}
          currentUser={profileEditor.currentUser}
        />
        <GroupSidebar
          key={`group-${conversationId}`}
          dictionary={dictionary}
          groupId={conversationId}
          locale={locale}
        />
      </div>

      <ProfileEditorModal dictionary={dictionary} editor={profileEditor} />
    </div>
  );
}
