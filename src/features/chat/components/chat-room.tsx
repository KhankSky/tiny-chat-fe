"use client";

import { useEffect, useMemo, useState } from "react";
import type { AuthUserResponse } from "@/features/auth/types";
import { useChatRoom } from "@/features/chat/hooks/use-chat-room";
import { getGroupDetail } from "@/features/groups/api/groups-api";
import { formatDateTime } from "@/i18n/format";
import type { Dictionary, Locale } from "@/i18n/types";
import { Avatar } from "@/shared/ui/avatar";
import { Button } from "@/shared/ui/button";
import { ErrorMessage } from "@/shared/ui/error-message";
import { Input } from "@/shared/ui/input";
import { LoadingState } from "@/shared/ui/loading-state";
import { StatusBadge } from "@/shared/ui/status-badge";

export function ChatRoom({
  locale,
  dictionary,
  groupId,
  currentUser = null,
  onToggleRightSidebar,
  rightSidebarOpen = true,
}: {
  locale: Locale;
  dictionary: Dictionary;
  groupId: number;
  currentUser?: AuthUserResponse | null;
  onToggleRightSidebar?: () => void;
  rightSidebarOpen?: boolean;
}) {
  const t = dictionary.chat;
  const [memberAvatars, setMemberAvatars] = useState<Record<number, string | null>>({});
  const [conversationTitle, setConversationTitle] = useState(t.roomEyebrow);
  const {
    bottomRef,
    content,
    error,
    loading,
    messages,
    sendMessage,
    setContent,
    socketError,
    socketStatus,
  } = useChatRoom({ currentUser, dictionary, groupId });
  const messagesWithAvatars = useMemo(
    () =>
      messages.map((message) => ({
        ...message,
        senderAvatarUrl:
          message.senderAvatarUrl ??
          (message.senderId === currentUser?.userId ? currentUser.avatarUrl : null) ??
          memberAvatars[message.senderId] ??
          null,
      })),
    [currentUser, memberAvatars, messages],
  );

  useEffect(() => {
    let active = true;

    async function loadMemberAvatars() {
      try {
        const groupDetail = await getGroupDetail(groupId);
        if (!active) return;

        const directChatTitle = groupDetail.directChat
          ? groupDetail.members.find((member) => member.userId !== currentUser?.userId)
              ?.displayName
          : null;
        setConversationTitle(
          directChatTitle || groupDetail.groupName || groupDetail.groupDescription || t.roomEyebrow,
        );
        setMemberAvatars(
          Object.fromEntries(
            groupDetail.members.map((member) => [member.userId, member.avatarUrl]),
          ),
        );
      } catch {
        if (active) {
          setMemberAvatars({});
        }
      }
    }

    void loadMemberAvatars();
    return () => {
      active = false;
    };
  }, [currentUser?.userId, groupId, t.roomEyebrow]);

  return (
    <section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-[#0d1322]">
      <header className="flex shrink-0 items-center justify-between border-b border-white/10 px-5 py-4 sm:px-6">
        <div className="min-w-0">
          <h2 className="truncate text-xl font-semibold text-white">{conversationTitle}</h2>
        </div>
        <div className="flex items-center gap-2">
          {onToggleRightSidebar ? (
            <button
              type="button"
              onClick={onToggleRightSidebar}
              aria-label={
                rightSidebarOpen ? t.toggleSidebar.collapse : t.toggleSidebar.open
              }
              title={rightSidebarOpen ? t.toggleSidebar.collapse : t.toggleSidebar.open}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-200 transition hover:border-cyan-300/60 hover:bg-cyan-400/15 hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:ring-offset-2 focus:ring-offset-[#0d1322]"
            >
              <span className="text-base leading-none" aria-hidden="true">
                {rightSidebarOpen ? ">" : "<"}
              </span>
            </button>
          ) : null}
          <StatusBadge
            tone={
              socketStatus === "connected"
                ? "success"
                : socketStatus === "connecting"
                  ? "info"
                  : socketStatus === "error"
                    ? "danger"
                    : "neutral"
            }
          >
            {t.socketStatus[socketStatus]}
          </StatusBadge>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.08),transparent_32%),linear-gradient(180deg,rgba(2,6,23,0.16),rgba(2,6,23,0.35))] px-4 py-5 sm:px-6">
        {loading ? (
          <LoadingState label={dictionary.common.loading} />
        ) : null}

        {error ? (
          <ErrorMessage>{error}</ErrorMessage>
        ) : null}

        {socketError ? (
          <ErrorMessage tone="warning">{socketError}</ErrorMessage>
        ) : null}

        {messagesWithAvatars.map((message, index) => {
          const isMine = currentUser?.userId === message.senderId;
          const previousMessage = messagesWithAvatars[index - 1];
          const startsSenderGroup = previousMessage?.senderId !== message.senderId;
          if (!startsSenderGroup) return null;

          const groupMessages = messagesWithAvatars.slice(index);
          const nextSenderIndex = groupMessages.findIndex(
            (nextMessage) => nextMessage.senderId !== message.senderId,
          );
          const senderMessages = groupMessages.slice(
            0,
            nextSenderIndex === -1 ? groupMessages.length : nextSenderIndex,
          );

          return (
            <div
              key={message.messageId}
              className={`mt-4 flex items-end gap-2 ${isMine ? "justify-end" : "justify-start"}`}
            >
              {!isMine ? (
                <Avatar
                  className="mb-0.5 h-8 w-8 self-end ring-1 ring-white/10"
                  src={message.senderAvatarUrl}
                  alt={message.senderName}
                />
              ) : null}

              <div className={`flex max-w-[72%] flex-col ${isMine ? "items-end" : "items-start"}`}>
                {!isMine ? (
                  <p className="mb-1 max-w-full truncate px-2 text-xs font-medium text-slate-300">
                    {message.senderName}
                  </p>
                ) : null}
                <div className={`flex flex-col gap-1 ${isMine ? "items-end" : "items-start"}`}>
                  {senderMessages.map((senderMessage, senderMessageIndex) => {
                    const isFirstInGroup = senderMessageIndex === 0;
                    const isLastInGroup = senderMessageIndex === senderMessages.length - 1;
                    const sentAt = formatDateTime(senderMessage.sentAt, locale);

                    return (
                      <div
                        key={senderMessage.messageId}
                        className={`group/message relative ${isMine ? "pr-1" : "pl-1"}`}
                      >
                        <div
                          aria-label={`${senderMessage.senderName}, ${sentAt}`}
                          className={`rounded-3xl px-4 py-2.5 text-sm leading-6 shadow-sm ${
                            isMine
                              ? "bg-cyan-400 text-slate-950"
                              : "border border-white/10 bg-white/[0.07] text-white"
                          } ${
                            isFirstInGroup && isLastInGroup
                              ? "rounded-3xl"
                              : isMine
                                ? isFirstInGroup
                                  ? "rounded-br-lg"
                                  : isLastInGroup
                                    ? "rounded-tr-lg"
                                    : "rounded-r-lg"
                                : isFirstInGroup
                                  ? "rounded-bl-lg"
                                  : isLastInGroup
                                    ? "rounded-tl-lg"
                                    : "rounded-l-lg"
                          }`}
                          title={sentAt}
                        >
                          <p className="whitespace-pre-wrap break-words">{senderMessage.content}</p>
                        </div>
                        <span
                          className={`pointer-events-none absolute top-1/2 hidden -translate-y-1/2 whitespace-nowrap rounded-full border border-white/10 bg-slate-950/95 px-2.5 py-1 text-[11px] font-medium text-slate-200 opacity-0 shadow-xl transition group-hover/message:block group-hover/message:opacity-100 ${
                            isMine ? "right-full mr-2" : "left-full ml-2"
                          }`}
                        >
                          {sentAt}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div className="shrink-0 border-t border-white/10 bg-[#0b111c] p-4">
        <div className="flex gap-3">
          <Input
            value={content}
            onChange={(event) => setContent(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                void sendMessage();
              }
            }}
            className="min-h-12 flex-1 rounded-full px-5 text-sm"
            placeholder={socketStatus === "connected" ? t.writeMessage : t.waitingForConnection}
            disabled={false}
          />
          <Button
            type="button"
            onClick={() => void sendMessage()}
            className="px-6"
          >
            {t.send}
          </Button>
        </div>
      </div>
    </section>
  );
}
