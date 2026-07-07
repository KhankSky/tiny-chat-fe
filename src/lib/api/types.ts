export type ApiResponse<T> = {
  code?: number;
  message?: string;
  data?: T;
};

export type AuthUserResponse = {
  accessToken: string;
  userId: number;
  email: string;
  authProvider: "LOCAL" | "GOOGLE";
  profileCompleted: boolean;
  displayName: string | null;
  avatarUrl: string | null;
  englishLevel: string | null;
  practiceGoal: string | null;
  interests: string[] | null;
};

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
