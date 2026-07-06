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

