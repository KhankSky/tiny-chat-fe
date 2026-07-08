import { apiGet, apiPost } from "@/shared/api/client";
import type {
  ChatMessage,
  ConversationResponse,
  GroupStreakResponse,
  HistoryResponse,
  UserStreakResponse,
} from "../types";

let myStreakCache: UserStreakResponse | null = null;
let myStreakRequest: Promise<UserStreakResponse> | null = null;
const groupStreakCache = new Map<number, GroupStreakResponse>();
const groupStreakRequests = new Map<number, Promise<GroupStreakResponse>>();

export function getConversations() {
  return apiGet<ConversationResponse[]>("/api/conversations");
}

export function getGroupMessages(groupId: number) {
  return apiGet<HistoryResponse>(`/api/groups/${groupId}/messages`);
}

export function getMyStreak() {
  return apiGet<UserStreakResponse>("/api/me/streak");
}

export function getMyStreakCached({ force = false }: { force?: boolean } = {}) {
  if (myStreakRequest) return myStreakRequest;
  if (!force && myStreakCache) return Promise.resolve(myStreakCache);

  myStreakRequest = getMyStreak()
    .then((streak) => {
      myStreakCache = streak;
      return streak;
    })
    .finally(() => {
      myStreakRequest = null;
    });

  return myStreakRequest;
}

export function getGroupStreak(groupId: number) {
  return apiGet<GroupStreakResponse>(`/api/groups/${groupId}/streak`);
}

export function getGroupStreakCached(
  groupId: number,
  { force = false }: { force?: boolean } = {},
) {
  const cached = groupStreakCache.get(groupId);
  const activeRequest = groupStreakRequests.get(groupId);
  if (activeRequest) return activeRequest;
  if (!force && cached) return Promise.resolve(cached);

  const request = getGroupStreak(groupId)
    .then((streak) => {
      groupStreakCache.set(groupId, streak);
      return streak;
    })
    .finally(() => {
      groupStreakRequests.delete(groupId);
    });

  groupStreakRequests.set(groupId, request);
  return request;
}

export function sendGroupMessage(groupId: number, content: string) {
  return apiPost<ChatMessage, { content: string }>(`/api/groups/${groupId}/messages`, {
    content,
  });
}
