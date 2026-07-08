import { apiPost } from "@/shared/api/client";
import type { CreateFeedbackRequest, FeedbackResponse } from "../types";

export function createFeedback(payload: CreateFeedbackRequest) {
  return apiPost<FeedbackResponse, CreateFeedbackRequest>("/api/feedback", payload);
}
