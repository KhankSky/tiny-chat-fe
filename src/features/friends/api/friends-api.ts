import { apiGet, apiPost, apiPut } from "@/shared/api/client";
import type {
  DirectConversationResponse,
  FriendProfileResponse,
  FriendRequestResponse,
  FriendUserSummary,
} from "../types";

let incomingRequestsCache: FriendRequestResponse[] | null = null;
let incomingRequestsRequest: Promise<FriendRequestResponse[]> | null = null;
let friendsCache: FriendUserSummary[] | null = null;
let friendsRequest: Promise<FriendUserSummary[]> | null = null;

export function clearFriendsCache() {
  incomingRequestsCache = null;
  incomingRequestsRequest = null;
  friendsCache = null;
  friendsRequest = null;
}

export function getGroupMemberProfile(groupId: number, memberUserId: number) {
  return apiGet<FriendProfileResponse>(`/api/groups/${groupId}/members/${memberUserId}/profile`);
}

export function sendFriendRequest(receiverId: number) {
  return apiPost<FriendRequestResponse, { receiverId: number }>("/api/friend-requests", {
    receiverId,
  }).then((request) => {
    clearFriendsCache();
    return request;
  });
}

export function getIncomingFriendRequests() {
  return apiGet<FriendRequestResponse[]>("/api/friend-requests/incoming");
}

export function getIncomingFriendRequestsCached({
  force = false,
}: { force?: boolean } = {}) {
  if (incomingRequestsRequest) return incomingRequestsRequest;
  if (!force && incomingRequestsCache) return Promise.resolve(incomingRequestsCache);

  incomingRequestsRequest = getIncomingFriendRequests()
    .then((requests) => {
      incomingRequestsCache = requests;
      return requests;
    })
    .finally(() => {
      incomingRequestsRequest = null;
    });

  return incomingRequestsRequest;
}

export function getOutgoingFriendRequests() {
  return apiGet<FriendRequestResponse[]>("/api/friend-requests/outgoing");
}

export function acceptFriendRequest(requestId: number) {
  return apiPut<FriendRequestResponse, Record<string, never>>(
    `/api/friend-requests/${requestId}/accept`,
    {},
  ).then((request) => {
    clearFriendsCache();
    return request;
  });
}

export function rejectFriendRequest(requestId: number) {
  return apiPut<FriendRequestResponse, Record<string, never>>(
    `/api/friend-requests/${requestId}/reject`,
    {},
  ).then((request) => {
    clearFriendsCache();
    return request;
  });
}

export function getFriends() {
  return apiGet<FriendUserSummary[]>("/api/friends");
}

export function getFriendsCached({ force = false }: { force?: boolean } = {}) {
  if (friendsRequest) return friendsRequest;
  if (!force && friendsCache) return Promise.resolve(friendsCache);

  friendsRequest = getFriends()
    .then((friends) => {
      friendsCache = friends;
      return friends;
    })
    .finally(() => {
      friendsRequest = null;
    });

  return friendsRequest;
}

export function openDirectConversation(friendId: number) {
  return apiPost<DirectConversationResponse, undefined>(
    `/api/friends/${friendId}/conversation`,
    undefined,
  );
}
