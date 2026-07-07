export type MeProfileResponse = {
  id: number;
  displayName: string | null;
  avatarUrl: string | null;
  email: string;
  username: string;
};

export type UpdateMeProfileRequest = {
  displayName: string | null;
  avatarUrl: string | null;
};
