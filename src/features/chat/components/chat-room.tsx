"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { AuthUserResponse } from "@/features/auth/types";
import { useChatRoom } from "@/features/chat/hooks/use-chat-room";
import type { DailyTopicResponse } from "@/features/chat/types";
import { getGroupDetail } from "@/features/groups/api/groups-api";
import { formatDateTime } from "@/i18n/format";
import type { Dictionary, Locale } from "@/i18n/types";
import { Avatar } from "@/shared/ui/avatar";
import { Button } from "@/shared/ui/button";
import { ErrorMessage } from "@/shared/ui/error-message";
import { Input } from "@/shared/ui/input";
import { LoadingState } from "@/shared/ui/loading-state";

export function ChatRoom({
  locale,
  dictionary,
  groupId,
  directChat = null,
  currentUser = null,
  onOpenConversationList,
  onToggleRightSidebar,
  rightSidebarOpen = true,
}: {
  locale: Locale;
  dictionary: Dictionary;
  groupId: number;
  directChat?: boolean | null;
  currentUser?: AuthUserResponse | null;
  onOpenConversationList?: () => void;
  onToggleRightSidebar?: () => void;
  rightSidebarOpen?: boolean;
}) {
  const t = dictionary.chat;
  const [memberAvatars, setMemberAvatars] = useState<Record<number, string | null>>({});
  const [detailError, setDetailError] = useState<string | null>(null);
  const [replyingDailyTopic] = useState<DailyTopicResponse | null>(null);
  const [conversationTitle, setConversationTitle] = useState(t.roomEyebrow);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const emojis = ["😀", "😂", "😊", "😍", "👍", "👏", "🙏", "🔥", "🎉", "💪", "❤️", "🤔"];
  const {
    bottomRef,
    content,
    error,
    loading,
    messages,
    presenceByUser,
    sendMessage,
    setContent,
    socketError,
    socketStatus,
    typingUsers,
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
  const [conversationAvatarUrl, setConversationAvatarUrl] = useState<string | null>(null);
  const directChatMember = useMemo(
    () =>
      currentUser
        ? messagesWithAvatars.find((message) => message.senderId !== currentUser.userId)
        : null,
    [currentUser, messagesWithAvatars],
  );
  const onlineCount = useMemo(
    () => Object.values(presenceByUser).filter(Boolean).length,
    [presenceByUser],
  );
  const primaryTypingUser = typingUsers[0] ?? null;
  const typingLabel = useMemo(() => {
    if (typingUsers.length === 0) return null;
    if (typingUsers.length === 1) {
      return t.typingSingle.replace("{name}", typingUsers[0].displayName);
    }
    if (typingUsers.length === 2) {
      return t.typingDouble
        .replace("{first}", typingUsers[0].displayName)
        .replace("{second}", typingUsers[1].displayName);
    }
    return t.typingMany.replace("{name}", typingUsers[0].displayName);
  }, [t.typingDouble, t.typingMany, t.typingSingle, typingUsers]);
  const typingAvatarUrl = primaryTypingUser
    ? memberAvatars[primaryTypingUser.userId] ?? null
    : null;
  const headerStatus = useMemo(() => {
    if (typingLabel) return typingLabel;
    if (socketStatus !== "connected") return t.socketStatus[socketStatus];
    if (directChatMember) {
      return presenceByUser[directChatMember.senderId] ? t.onlineNow : t.offlineNow;
    }
    return t.onlineCount.replace("{count}", String(onlineCount));
  }, [directChatMember, onlineCount, presenceByUser, socketStatus, t, typingLabel]);

  async function handleSendMessage() {
    if (!content.trim()) return;
    await sendMessage();
  }

  useEffect(() => {
    let active = true;

    async function loadMemberAvatars() {
      try {
        const groupDetail = await getGroupDetail(groupId);
        if (!active) return;

        const directChatMember = groupDetail.directChat
          ? groupDetail.members.find((member) => member.userId !== currentUser?.userId)
          : null;
        const directChatTitle = directChatMember?.displayName;
        setConversationTitle(
          directChatTitle || groupDetail.groupName || groupDetail.groupDescription || t.roomEyebrow,
        );
        setConversationAvatarUrl(groupDetail.groupAvatarUrl || directChatMember?.avatarUrl || null);
        setMemberAvatars(
          Object.fromEntries(
            groupDetail.members.map((member) => [member.userId, member.avatarUrl]),
          ),
        );
      } catch {
        if (active) {
          setConversationAvatarUrl(null);
          setMemberAvatars({});
          setConversationTitle(t.conversationUnavailable);
          setDetailError(t.conversationUnavailable);
        }
      }
    }

    void loadMemberAvatars();
    return () => {
      active = false;
    };
  }, [currentUser?.userId, directChat, groupId, t.conversationUnavailable, t.roomEyebrow]);

  return (
    <section className="tc-panel flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-[#0d1322]">
      <header className="flex h-20 shrink-0 items-center justify-between border-b border-white/10 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          {onOpenConversationList ? (
            <button
              type="button"
              onClick={onOpenConversationList}
              aria-label={t.sidebarTitle}
              title={t.sidebarTitle}
              className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-3xl leading-none text-slate-200 transition hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:ring-offset-2 focus:ring-offset-[#0d1322] lg:hidden"
            >
              <span aria-hidden="true">‹</span>
            </button>
          ) : null}
          <Avatar
            className="h-12 w-12 ring-1 ring-white/10"
            src={conversationAvatarUrl}
            alt={conversationTitle}
          />
          <div className="min-w-0">
            <h2 className="truncate text-lg font-semibold text-white sm:text-xl">
              {conversationTitle}
            </h2>
          </div>
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
              <span className="text-base leading-none lg:hidden" aria-hidden="true">
                i
              </span>
              <span className="hidden text-base leading-none lg:inline" aria-hidden="true">
                {rightSidebarOpen ? ">" : "<"}
              </span>
            </button>
          ) : null}
        </div>
      </header>

      <div className="tc-chat-canvas min-h-0 flex-1 overscroll-contain overflow-y-auto bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.08),transparent_32%),linear-gradient(180deg,rgba(2,6,23,0.16),rgba(2,6,23,0.35))] px-3 py-4 sm:px-6 sm:py-5">
        {loading ? (
          <LoadingState label={dictionary.common.loading} />
        ) : null}

        {(error || detailError) ? (
          <div className="space-y-3">
            <ErrorMessage>{error || detailError}</ErrorMessage>
            <Link href={`/${locale}/conversations`} className="inline-flex rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-white transition hover:border-cyan-300/50 hover:bg-cyan-300/10">
              {t.backToConversations}
            </Link>
          </div>
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

              <div className={`flex max-w-[82%] flex-col sm:max-w-[72%] ${isMine ? "items-end" : "items-start"}`}>
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
                    const showReadReceipt =
                      isMine &&
                      isLastInGroup &&
                      senderMessage.readCount > 1;

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
                        {showReadReceipt ? (
                          <p className="mt-1 px-2 text-[11px] text-slate-400">
                            {t.seenByCount.replace(
                              "{count}",
                              String(senderMessage.readCount - 1),
                            )}
                          </p>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
        {typingLabel && primaryTypingUser ? (
          <div className="mt-4 flex items-end gap-2 justify-start">
            <Avatar
              className="mb-0.5 h-8 w-8 self-end ring-1 ring-white/10"
              src={typingAvatarUrl}
              alt={primaryTypingUser.displayName}
            />
            <div className="flex max-w-[82%] flex-col items-start sm:max-w-[72%]">
              <p className="mb-1 max-w-full truncate px-2 text-xs font-medium text-slate-300">
                {primaryTypingUser.displayName}
              </p>
              <div className="rounded-3xl rounded-bl-lg border border-white/10 bg-white/[0.07] px-3 py-2.5 text-white shadow-sm">
                <div className="flex items-center gap-1.5">
                  <span className="tc-typing-dot h-2.5 w-2.5 rounded-full bg-cyan-300/90" />
                  <span className="tc-typing-dot h-2.5 w-2.5 rounded-full bg-cyan-300/75 [animation-delay:120ms]" />
                  <span className="tc-typing-dot h-2.5 w-2.5 rounded-full bg-cyan-300/55 [animation-delay:240ms]" />
                </div>
              </div>
              {typingUsers.length > 1 ? (
                <p className="mt-1 px-2 text-[11px] text-slate-400">
                  +{typingUsers.length - 1} {typingUsers.length - 1 === 1 ? "other person" : "others"}
                </p>
              ) : null}
            </div>
          </div>
        ) : null}
        <div ref={bottomRef} />
      </div>

      <div className="tc-sidebar flex h-20 shrink-0 items-center border-t border-white/10 bg-[#0b111c] px-3 pb-[env(safe-area-inset-bottom)] sm:px-4">
        {replyingDailyTopic ? (
          <div className="mb-3 flex items-start gap-3 rounded-2xl border border-cyan-300/20 bg-cyan-300/[0.07] px-4 py-3">
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-cyan-200/80">
                {t.dailyTopicReplying}
              </p>
              <p className="mt-1 truncate text-sm font-medium text-white">
                {replyingDailyTopic.content}
              </p>
            </div>
            {/*<button*/}
            {/*  type="button"*/}
            {/*  onClick={() => setReplyingDailyTopic(null)}*/}
            {/*  aria-label={dictionary.common.close}*/}
            {/*  title={dictionary.common.close}*/}
            {/*  className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-sm text-slate-200 transition hover:border-cyan-300/60 hover:bg-cyan-400/15 hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:ring-offset-2 focus:ring-offset-[#0b111c]"*/}
            {/*>*/}
            {/*  ×*/}
            {/*</button>*/}
          </div>
        ) : null}
        <form
          className="flex w-full gap-2 sm:gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            void handleSendMessage();
          }}
        >
          <div className="relative flex min-w-0 flex-1">
          <Input
            value={content}
            onChange={(event) => setContent(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                void handleSendMessage();
              }
            }}
            className="h-12 flex-1 rounded-full px-5 pr-12 text-sm"
            placeholder={socketStatus === "connected" ? t.writeMessage : t.waitingForConnection}
            disabled={false}
          />
          <button type="button" aria-label={t.emoji} title={t.emoji} onClick={() => setEmojiOpen((open) => !open)} className="absolute right-3 top-1/2 -translate-y-1/2 text-xl">😊</button>
          {emojiOpen ? <div className="absolute bottom-14 right-0 z-10 grid grid-cols-6 gap-1 rounded-2xl border border-white/10 bg-[#111a2b] p-2 shadow-2xl">{emojis.map((emoji) => <button key={emoji} type="button" className="rounded-lg p-1.5 text-xl hover:bg-white/10" onClick={() => { setContent((value) => `${value}${emoji}`); setEmojiOpen(false); }}>{emoji}</button>)}</div> : null}
          </div>
          <Button type="submit" className="h-12 shrink-0 px-4 py-0 sm:px-6">
            {t.send}
          </Button>
        </form>
      </div>
    </section>
  );
}
