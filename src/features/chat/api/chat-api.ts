import { apiGet, apiPost } from "@/shared/api/client";
import type {
  ChatMessage,
  ConversationResponse,
  GroupStreakResponse,
  HistoryResponse,
  UserStreakResponse,
} from "../types";

export function getConversations() {
  return apiGet<ConversationResponse[]>("/api/conversations");
}

export function getGroupMessages(groupId: number) {
  return apiGet<HistoryResponse>(`/api/groups/${groupId}/messages`);
}

export function getMyStreak() {
  return apiGet<UserStreakResponse>("/api/me/streak");
}

export function getGroupStreak(groupId: number) {
  return apiGet<GroupStreakResponse>(`/api/groups/${groupId}/streak`);
}

export function sendGroupMessage(groupId: number, content: string) {
  return apiPost<ChatMessage, { content: string }>(`/api/groups/${groupId}/messages`, {
    content,
  });
}
