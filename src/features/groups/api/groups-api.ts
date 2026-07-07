import { apiGet, apiPost, apiPut, apiUpload } from "@/shared/api/client";
import type { GroupDetailResponse, MatchGroupResponse } from "../types";

export function matchGroup() {
  return apiPost<MatchGroupResponse, Record<string, never>>("/api/groups/match");
}

export function getGroupDetail(groupId: number) {
  return apiGet<GroupDetailResponse>(`/api/groups/${groupId}/detail`);
}

export function updateGroupDetail(
  groupId: number,
  body: {
    groupName?: string | null;
    groupDescription?: string | null;
    groupAvatarUrl?: string | null;
  },
) {
  return apiPut<GroupDetailResponse, typeof body>(`/api/groups/${groupId}/detail`, body);
}

export function uploadGroupAvatar(groupId: number, formData: FormData) {
  return apiUpload<GroupDetailResponse>(`/api/groups/${groupId}/avatar`, formData);
}
