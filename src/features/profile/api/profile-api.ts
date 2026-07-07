import { apiGet, apiPut, apiUpload } from "@/shared/api/client";
import type { MeProfileResponse, UpdateMeProfileRequest } from "../types";

export function getMeProfile() {
  return apiGet<MeProfileResponse>("/api/me/profile");
}

export function updateMeProfile(payload: UpdateMeProfileRequest) {
  return apiPut<MeProfileResponse, UpdateMeProfileRequest>("/api/me/profile", payload);
}

export function uploadMeAvatar(formData: FormData) {
  return apiUpload<MeProfileResponse>("/api/me/avatar", formData);
}
