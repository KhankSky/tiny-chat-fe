import { apiGet, apiPost } from "@/shared/api/client";
import { getStoredAuthUser } from "@/shared/auth/session";
import type {
  ChatMessage,
  ConversationResponse,
  ReadReceiptResponse,
  DailyTopicResponse,
  GroupStreakResponse,
  HistoryResponse,
  UserStreakResponse,
} from "../types";

type UserStreakCache = {
  userId: number;
  streak: UserStreakResponse;
};

type UserStreakRequest = {
  userId: number;
  promise: Promise<UserStreakResponse>;
};

let myStreakCache: UserStreakCache | null = null;
let myStreakRequest: UserStreakRequest | null = null;
const myStreakActivityRefreshUsed = new Set<number>();
const groupStreakCache = new Map<number, GroupStreakResponse>();
const groupStreakRequests = new Map<number, Promise<GroupStreakResponse>>();
const groupStreakActivityRefreshUsed = new Set<number>();
const dailyTopicCache = new Map<number, DailyTopicResponse>();
const dailyTopicRequests = new Map<number, Promise<DailyTopicResponse>>();

export function getConversations() {
  return apiGet<ConversationResponse[]>("/api/conversations");
}

export function getGroupMessages(groupId: number, page = 0, size = 30) {
  return apiGet<HistoryResponse>(`/api/groups/${groupId}/messages?page=${page}&size=${size}`);
}

export function getDailyTopic(groupId: number) {
  return apiGet<DailyTopicResponse>(`/api/groups/${groupId}/daily-topic`);
}

export function getDailyTopicCached(groupId: number) {
  const cached = dailyTopicCache.get(groupId);
  const activeRequest = dailyTopicRequests.get(groupId);
  if (activeRequest) return activeRequest;
  if (cached) return Promise.resolve(cached);

  const request = getDailyTopic(groupId)
    .then((topic) => {
      dailyTopicCache.set(groupId, topic);
      return topic;
    })
    .finally(() => {
      dailyTopicRequests.delete(groupId);
    });

  dailyTopicRequests.set(groupId, request);
  return request;
}

export function getMyStreak() {
  return apiGet<UserStreakResponse>("/api/me/streak");
}

export function getMyStreakCached({ force = false }: { force?: boolean } = {}) {
  const userId = getStoredAuthUser()?.userId;
  if (!userId) return getMyStreak();

  if (myStreakRequest?.userId === userId) return myStreakRequest.promise;
  if (!force && myStreakCache?.userId === userId) {
    return Promise.resolve(myStreakCache.streak);
  }

  const request = getMyStreak()
    .then((streak) => {
      myStreakCache = { userId, streak };
      return streak;
    })
    .finally(() => {
      if (myStreakRequest?.promise === request) {
        myStreakRequest = null;
      }
    });
  myStreakRequest = { userId, promise: request };

  return request;
}

export function refreshMyStreakAfterActivityOnce() {
  const userId = getStoredAuthUser()?.userId;
  if (!userId) return getMyStreakCached();
  if (myStreakActivityRefreshUsed.has(userId)) return getMyStreakCached();
  myStreakActivityRefreshUsed.add(userId);
  if (myStreakCache?.userId === userId) myStreakCache = null;
  return getMyStreakCached();
}

export function getGroupStreak(groupId: number) {
  return apiGet<GroupStreakResponse>(`/api/groups/${groupId}/streak`);
}

export function getGroupStreakCached(
  groupId: number,
  _options: { force?: boolean } = {},
) {
  const cached = groupStreakCache.get(groupId);
  const activeRequest = groupStreakRequests.get(groupId);
  if (activeRequest) return activeRequest;
  if (cached) {
    return Promise.resolve(cached);
  }

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

export function refreshGroupStreakAfterActivityOnce(groupId: number) {
  if (groupStreakActivityRefreshUsed.has(groupId)) return getGroupStreakCached(groupId);
  groupStreakActivityRefreshUsed.add(groupId);
  groupStreakCache.delete(groupId);
  return getGroupStreakCached(groupId);
}

export function sendGroupMessage(
  groupId: number,
  body: {
    content: string;
    replyTopicId?: number;
    replyTopicContent?: string;
  },
) {
  return apiPost<ChatMessage, typeof body>(`/api/groups/${groupId}/messages`, body);
}

export function markConversationRead(groupId: number, messageId: number) {
  return apiPost<ReadReceiptResponse, { messageId: number }>(`/api/groups/${groupId}/read`, {
    messageId,
  });
}
