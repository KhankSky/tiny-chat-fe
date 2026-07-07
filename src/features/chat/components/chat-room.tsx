"use client";

import type { AuthUserResponse } from "@/features/auth/types";
import { useChatRoom } from "@/features/chat/hooks/use-chat-room";
import { formatDateTime } from "@/i18n/format";
import type { Dictionary, Locale } from "@/i18n/types";
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
}: {
  locale: Locale;
  dictionary: Dictionary;
  groupId: number;
  currentUser?: AuthUserResponse | null;
}) {
  const t = dictionary.chat;
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

  return (
    <section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-[#0d1322]">
      <header className="flex shrink-0 items-center justify-between border-b border-white/10 px-5 py-4 sm:px-6">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-300/90">
            {t.roomEyebrow}
          </p>
          <h2 className="mt-2 truncate text-xl font-semibold text-white">Group #{groupId}</h2>
        </div>
        <div className="flex items-center gap-2">
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
          <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
            {currentUser ? currentUser.email ?? dictionary.common.loggedIn : dictionary.common.anonymous}
          </div>
        </div>
      </header>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.08),transparent_32%),linear-gradient(180deg,rgba(2,6,23,0.16),rgba(2,6,23,0.35))] px-4 py-5 sm:px-6">
        {loading ? (
          <LoadingState label={dictionary.common.loading} />
        ) : null}

        {error ? (
          <ErrorMessage>{error}</ErrorMessage>
        ) : null}

        {socketError ? (
          <ErrorMessage tone="warning">{socketError}</ErrorMessage>
        ) : null}

        {messages.map((message) => {
          const isMine = currentUser?.userId === message.senderId;
          return (
            <div key={message.messageId} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[75%] rounded-3xl px-4 py-3 text-sm leading-7 ${
                  isMine
                    ? "bg-cyan-400 text-slate-950"
                    : "border border-white/10 bg-white/5 text-white"
                }`}
              >
                <div className="mb-1 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.25em] opacity-70">
                  <span>{message.senderName}</span>
                  <span>-</span>
                  <span>{formatDateTime(message.sentAt, locale)}</span>
                </div>
                <p>{message.content}</p>
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
