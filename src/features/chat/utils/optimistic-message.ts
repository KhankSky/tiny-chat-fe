import type { AuthUserResponse } from "@/features/auth/types";
import type { ChatMessage } from "@/features/chat/types";

export type LocalChatMessage = ChatMessage & {
  clientTempId?: string;
};

export function createOptimisticMessage({
  content,
  currentUser,
  fallbackSenderName,
  groupId,
  replyTopicContent = null,
  replyTopicId = null,
}: {
  content: string;
  currentUser: AuthUserResponse | null;
  fallbackSenderName: string;
  groupId: number;
  replyTopicContent?: string | null;
  replyTopicId?: number | null;
}) {
  return {
    messageId: -Date.now(),
    clientTempId: `temp-${Date.now()}`,
    groupId,
    senderId: currentUser?.userId ?? -1,
    senderName: currentUser?.displayName ?? currentUser?.email ?? fallbackSenderName,
    senderAvatarUrl: currentUser?.avatarUrl ?? null,
    content,
    replyTopicId,
    replyTopicContent,
    sentAt: new Date().toISOString(),
    readCount: 1,
    readByCurrentUser: true,
  } satisfies LocalChatMessage;
}

export function reconcileIncomingMessage(
  messages: LocalChatMessage[],
  nextMessage: ChatMessage,
) {
  if (messages.some((message) => message.messageId === nextMessage.messageId)) {
    return messages;
  }

  const matchingOptimisticMessage = messages.some(
    (message) =>
      message.senderId === nextMessage.senderId &&
      message.content === nextMessage.content &&
      message.messageId < 0 &&
      Math.abs(new Date(message.sentAt).getTime() - new Date(nextMessage.sentAt).getTime()) <
        15_000,
  );

  if (matchingOptimisticMessage) {
    return messages.map((message) =>
      message.messageId < 0 &&
      message.senderId === nextMessage.senderId &&
      message.content === nextMessage.content
        ? nextMessage
        : message,
    );
  }

  return [...messages, nextMessage];
}
