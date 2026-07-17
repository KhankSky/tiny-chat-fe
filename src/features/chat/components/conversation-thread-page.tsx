"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { logout } from "@/shared/api/client";
import { useConversations } from "@/features/chat/hooks/use-conversations";
import { ProfileEditorModal } from "@/features/profile/components/profile-editor-modal";
import { useProfileEditor } from "@/features/profile/hooks/use-profile-editor";
import type { Dictionary, Locale } from "@/i18n/types";
import type { ThemeMode } from "@/theme/use-theme-preference";
import { ChatRoom } from "./chat-room";
import { ConversationSidebar } from "./conversation-sidebar";
import { DirectChatSidebar } from "./direct-chat-sidebar";
import { GroupSidebar } from "./group-sidebar";

export function ConversationThreadPage({
  locale,
  dictionary,
  conversationId,
  onLocaleChange,
  onThemeChange,
  theme,
}: {
  locale: Locale;
  dictionary: Dictionary;
  conversationId: number;
  onLocaleChange?: (locale: Locale) => void;
  theme?: ThemeMode;
  onThemeChange?: (theme: ThemeMode) => void;
}) {
  const router = useRouter();
  const conversations = useConversations({ dictionary, locale });
  const profileEditor = useProfileEditor(dictionary);
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(false);
  const [mobileGroupInfoOpen, setMobileGroupInfoOpen] = useState(false);
  const [mobileDirectInfoOpen, setMobileDirectInfoOpen] = useState(false);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);
  const activeConversation = conversations.find(
    (conversation) => conversation.conversationId === conversationId,
  );
  const directChat = activeConversation ? activeConversation.directChat : null;
  async function handleLogout() {
    try { await logout(); } finally { router.push(`/${locale}/auth/login`); }
  }

  return (
    <div className="tc-app-shell h-dvh w-full overflow-hidden bg-[#070d18] text-white">
      <div
        className={
          rightSidebarOpen
            ? "grid h-full min-h-0 w-full lg:grid-cols-[340px_minmax(0,1fr)_360px]"
            : "grid h-full min-h-0 w-full lg:grid-cols-[340px_minmax(0,1fr)]"
        }
      >
        <div className="hidden min-h-0 lg:block">
          <ConversationSidebar
            dictionary={dictionary}
            conversations={conversations}
            activeGroupId={conversationId}
            currentUser={profileEditor.currentUser}
            onEditProfile={profileEditor.openProfileEditor}
            onLogout={() => void handleLogout()}
          />
        </div>
        <ChatRoom
          key={`chat-${conversationId}`}
          locale={locale}
          dictionary={dictionary}
          groupId={conversationId}
          directChat={directChat}
          currentUser={profileEditor.currentUser}
          rightSidebarOpen={
            directChat === true
              ? mobileDirectInfoOpen
              : rightSidebarOpen || mobileGroupInfoOpen
          }
          onOpenConversationList={() => setLeftSidebarOpen(true)}
          onToggleRightSidebar={() => {
            if (directChat === true) {
              setMobileDirectInfoOpen(true);
              return;
            }
            if (window.matchMedia("(min-width: 1024px)").matches) {
              setRightSidebarOpen((open) => !open);
            } else {
              setMobileGroupInfoOpen(true);
            }
          }}
        />
        {directChat === false && rightSidebarOpen ? (
          <div className="hidden min-h-0 lg:block">
            <GroupSidebar
              key={`group-${conversationId}`}
              dictionary={dictionary}
              groupId={conversationId}
              locale={locale}
              currentUser={profileEditor.currentUser}
            />
          </div>
        ) : directChat ? (
          <div className="hidden min-h-0 lg:block">
            <DirectChatSidebar
              key={`direct-${conversationId}`}
              dictionary={dictionary}
              groupId={conversationId}
              currentUser={profileEditor.currentUser}
            />
          </div>
        ) : null}
      </div>

      {leftSidebarOpen ? (
        <div
          className="fixed inset-0 z-40 bg-slate-950/65 backdrop-blur-sm lg:hidden"
          onClick={() => setLeftSidebarOpen(false)}
        >
          <div
            className="h-full w-[min(22rem,88vw)] overflow-hidden border-r border-white/10 bg-[#0b111c] shadow-2xl shadow-black/40"
            onClick={(event) => event.stopPropagation()}
          >
            <ConversationSidebar
              dictionary={dictionary}
              conversations={conversations}
              activeGroupId={conversationId}
              currentUser={profileEditor.currentUser}
              onEditProfile={() => {
                setLeftSidebarOpen(false);
                profileEditor.openProfileEditor();
              }}
              onLogout={() => { setLeftSidebarOpen(false); void handleLogout(); }}
            />
          </div>
        </div>
      ) : null}

      {directChat === false && mobileGroupInfoOpen ? (
        <div
          className="fixed inset-0 z-40 bg-[#0b111c] lg:hidden"
          onClick={() => setMobileGroupInfoOpen(false)}
        >
          <div
            className="h-full w-full overflow-hidden bg-[#0b111c]"
            onClick={(event) => event.stopPropagation()}
          >
            <GroupSidebar
              key={`mobile-group-${conversationId}`}
              dictionary={dictionary}
              groupId={conversationId}
              locale={locale}
              currentUser={profileEditor.currentUser}
              onClose={() => setMobileGroupInfoOpen(false)}
            />
          </div>
        </div>
      ) : directChat === true && mobileDirectInfoOpen ? (
        <div
          className="fixed inset-0 z-40 bg-[#0b111c] lg:hidden"
          onClick={() => setMobileDirectInfoOpen(false)}
        >
          <div
            className="h-full w-full overflow-hidden bg-[#0b111c]"
            onClick={(event) => event.stopPropagation()}
          >
            <DirectChatSidebar
              key={`mobile-direct-${conversationId}`}
              dictionary={dictionary}
              groupId={conversationId}
              currentUser={profileEditor.currentUser}
              onClose={() => setMobileDirectInfoOpen(false)}
            />
          </div>
        </div>
      ) : null}

      <ProfileEditorModal
        dictionary={dictionary}
        editor={profileEditor}
        locale={locale}
        onLocaleChange={onLocaleChange}
        theme={theme}
        onThemeChange={onThemeChange}
      />
    </div>
  );
}
