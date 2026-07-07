import type { ChatMessage } from "@/features/chat/types";
import { reconcileIncomingMessage, type LocalChatMessage } from "@/features/chat/utils/optimistic-message";
import { logClientError } from "@/shared/lib/logger";
import { StompClient } from "@/shared/realtime/stomp";

function parseChatMessage(payload: string) {
  return JSON.parse(payload) as ChatMessage;
}

export function subscribeToGroupMessages({
  client,
  groupId,
  invalidDataMessage,
  onInvalidData,
  setMessages,
  unknownErrorMessage,
}: {
  client: StompClient;
  groupId: number;
  invalidDataMessage: string;
  onInvalidData: (message: string) => void;
  setMessages: (updater: (messages: LocalChatMessage[]) => LocalChatMessage[]) => void;
  unknownErrorMessage: string;
}) {
  return client.subscribe(`/topic/groups/${groupId}/messages`, (body) => {
    try {
      const nextMessage = parseChatMessage(body);
      setMessages((messages) => reconcileIncomingMessage(messages, nextMessage));
    } catch (messageError) {
      logClientError("Received invalid chat data", {
        groupId,
        error: messageError instanceof Error ? messageError.message : unknownErrorMessage,
      });
      onInvalidData(invalidDataMessage);
    }
  });
}
