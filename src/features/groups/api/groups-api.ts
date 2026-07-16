import { apiGet, apiPost, apiPut, apiUpload } from "@/shared/api/client";
import type { GroupDetailResponse, MatchGroupResponse } from "../types";

const groupDetailCache = new Map<number, GroupDetailResponse>();
const groupDetailRequests = new Map<number, Promise<GroupDetailResponse>>();

export function matchGroup() {
  return apiPost<MatchGroupResponse, Record<string, never>>("/api/groups/match");
}

export function leaveGroup(groupId: number) {
  return apiPost<void, Record<string, never>>(`/api/groups/${groupId}/leave`);
}

export function getGroupDetail(groupId: number) {
  const cached = groupDetailCache.get(groupId);
  if (cached) return Promise.resolve(cached);

  const activeRequest = groupDetailRequests.get(groupId);
  if (activeRequest) return activeRequest;

  const request = apiGet<GroupDetailResponse>(`/api/groups/${groupId}/detail`)
    .then((detail) => {
      groupDetailCache.set(groupId, detail);
      return detail;
    })
    .finally(() => {
      groupDetailRequests.delete(groupId);
    });

  groupDetailRequests.set(groupId, request);
  return request;
}

export function updateGroupDetail(
  groupId: number,
  body: {
    groupName?: string | null;
    groupDescription?: string | null;
    groupAvatarUrl?: string | null;
  },
) {
  return apiPut<GroupDetailResponse, typeof body>(`/api/groups/${groupId}/detail`, body).then(
    (detail) => {
      groupDetailCache.set(groupId, detail);
      return detail;
    },
  );
}

export function uploadGroupAvatar(groupId: number, formData: FormData) {
  return apiUpload<GroupDetailResponse>(`/api/groups/${groupId}/avatar`, formData).then(
    (detail) => {
      groupDetailCache.set(groupId, detail);
      return detail;
    },
  );
}
