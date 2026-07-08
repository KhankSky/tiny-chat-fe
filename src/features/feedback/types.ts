export type FeedbackType =
  | "BUG"
  | "IMPROVEMENT"
  | "UI_UX"
  | "CHAT_GROUP"
  | "ACCOUNT"
  | "OTHER";

export type FeedbackSeverity = "LOW" | "MEDIUM" | "BLOCKING";

export type FeedbackStatus =
  | "NEW"
  | "TRIAGED"
  | "PLANNED"
  | "IN_PROGRESS"
  | "RESOLVED"
  | "WONT_FIX";

export type CreateFeedbackRequest = {
  type: FeedbackType;
  severity: FeedbackSeverity;
  message: string;
  pageUrl?: string | null;
  route?: string | null;
  conversationId?: number | null;
  groupId?: number | null;
  locale?: string | null;
  theme?: string | null;
  viewportWidth?: number | null;
  viewportHeight?: number | null;
  userAgent?: string | null;
};

export type FeedbackResponse = {
  id: number;
  userId: number;
  type: FeedbackType;
  severity: FeedbackSeverity;
  status: FeedbackStatus;
  message: string;
  route?: string | null;
  conversationId?: number | null;
  groupId?: number | null;
  createdAt: string;
};
