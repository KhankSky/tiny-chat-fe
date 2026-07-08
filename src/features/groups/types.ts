export type MatchGroupResponse = {
  groupId: number;
  createdNewGroup: boolean;
  action: string;
  targetLevel: string | null;
  memberCount: number | null;
  maxMembers: number | null;
  groupName: string | null;
  groupDescription: string | null;
  sharedInterests: string[] | null;
  matchedGoal: string | null;
  matchedReason: string | null;
  joinedAt: string | null;
};

export type GroupMemberResponse = {
  userId: number;
  displayName: string | null;
  avatarUrl: string | null;
  role: "OWNER" | "MEMBER";
};

export type GroupDetailResponse = {
  groupId: number;
  groupName: string | null;
  groupDescription: string | null;
  groupAvatarUrl: string | null;
  directChat: boolean;
  memberCount: number;
  members: GroupMemberResponse[];
};
