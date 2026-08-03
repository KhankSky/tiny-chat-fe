export type AuthUserResponse = {
  accessToken: string | null;
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

export type AuthCredentials = {
  email: string;
  password: string;
};

export type RegisterCredentials = AuthCredentials & {
  confirmPassword: string;
};

export type GoogleLoginRequest = { idToken: string };

export type CompleteProfileRequest = {
  displayName: string;
  avatarUrl: string | null;
  englishLevel: "LEVEL_A" | "LEVEL_B" | "LEVEL_C";
  practiceGoal:
    | "DAILY_CHAT"
    | "IMPROVE_WRITING"
    | "MAKE_FRIENDS"
    | "TOEIC_BASIC"
    | "IELTS_BASIC";
  interests: string[];
  bio: string | null;
  timezone: string;
  availability: ("MORNING" | "AFTERNOON" | "EVENING" | "LATE_NIGHT" | "WEEKEND")[];
  practiceFrequency: "CASUAL" | "FEW_TIMES_A_WEEK" | "ALMOST_DAILY";
};
