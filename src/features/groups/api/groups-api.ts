import { apiGet, apiPost } from "@/shared/api/client";
import type { GroupDetailResponse, MatchGroupResponse } from "../types";

export function matchGroup() {
  return apiPost<MatchGroupResponse, Record<string, never>>("/api/groups/match");
}

export function getGroupDetail(groupId: number) {
  return apiGet<GroupDetailResponse>(`/api/groups/${groupId}/detail`);
}
