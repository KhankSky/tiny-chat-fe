import { apiGet, apiPost } from "@/shared/api/client";
import type { ChatMessage, ConversationResponse, HistoryResponse } from "../types";

export function getConversations() {
  return apiGet<ConversationResponse[]>("/api/conversations");
}

export function getGroupMessages(groupId: number) {
  return apiGet<HistoryResponse>(`/api/groups/${groupId}/messages`);
}

export function sendGroupMessage(groupId: number, content: string) {
  return apiPost<ChatMessage, { content: string }>(`/api/groups/${groupId}/messages`, {
    content,
  });
}
