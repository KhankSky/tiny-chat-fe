import { apiGet, apiPost, apiPut } from "@/shared/api/client";
import type {
  DirectConversationResponse,
  FriendProfileResponse,
  FriendRequestResponse,
  FriendUserSummary,
} from "../types";

export function getGroupMemberProfile(groupId: number, memberUserId: number) {
  return apiGet<FriendProfileResponse>(`/api/groups/${groupId}/members/${memberUserId}/profile`);
}

export function sendFriendRequest(receiverId: number) {
  return apiPost<FriendRequestResponse, { receiverId: number }>("/api/friend-requests", {
    receiverId,
  });
}

export function getIncomingFriendRequests() {
  return apiGet<FriendRequestResponse[]>("/api/friend-requests/incoming");
}

export function getOutgoingFriendRequests() {
  return apiGet<FriendRequestResponse[]>("/api/friend-requests/outgoing");
}

export function acceptFriendRequest(requestId: number) {
  return apiPut<FriendRequestResponse, Record<string, never>>(
    `/api/friend-requests/${requestId}/accept`,
    {},
  );
}

export function rejectFriendRequest(requestId: number) {
  return apiPut<FriendRequestResponse, Record<string, never>>(
    `/api/friend-requests/${requestId}/reject`,
    {},
  );
}

export function getFriends() {
  return apiGet<FriendUserSummary[]>("/api/friends");
}

export function openDirectConversation(friendId: number) {
  return apiPost<DirectConversationResponse, undefined>(
    `/api/friends/${friendId}/conversation`,
    undefined,
  );
}
