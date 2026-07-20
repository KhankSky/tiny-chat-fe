import { apiGet, apiPost } from "@/shared/api/client";
import type { AuthCredentials, AuthUserResponse, CompleteProfileRequest, GoogleLoginRequest } from "../types";

export function login(payload: AuthCredentials) {
  return apiPost<AuthUserResponse, AuthCredentials>("/api/auth/p/login", payload);
}

export function register(payload: AuthCredentials) {
  return apiPost<AuthUserResponse, AuthCredentials>("/api/auth/p/register", payload);
}

export function googleLogin(payload: GoogleLoginRequest) {
  return apiPost<AuthUserResponse, GoogleLoginRequest>("/api/auth/p/google", payload);
}

export function getCurrentUser() {
  return apiGet<AuthUserResponse>("/api/auth/me");
}

export function completeProfile(payload: CompleteProfileRequest) {
  return apiPost<AuthUserResponse, CompleteProfileRequest>("/api/auth/profile/complete", payload);
}
