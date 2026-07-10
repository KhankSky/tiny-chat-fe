export type ConversationResponse = {
  conversationId: number;
  groupId: number;
  title: string;
  description: string | null;
  avatarUrl: string | null;
  lastMessage: string | null;
  lastMessageAt: string | null;
  memberCount: number;
  unreadCount: number;
};

export type ChatMessage = {
  messageId: number;
  groupId: number;
  senderId: number;
  senderName: string;
  senderAvatarUrl: string | null;
  content: string;
  replyTopicId: number | null;
  replyTopicContent: string | null;
  sentAt: string;
  readCount: number;
  readByCurrentUser: boolean;
};

export type HistoryResponse = {
  items: ChatMessage[];
};

export type TypingEvent = {
  groupId: number;
  userId: number;
  displayName: string;
  typing: boolean;
  occurredAt: string;
};

export type PresenceEvent = {
  groupId: number;
  userId: number;
  displayName: string;
  online: boolean;
  occurredAt: string;
};

export type ReadReceiptResponse = {
  groupId: number;
  userId: number;
  messageId: number;
  readAt: string;
};

export type ConversationUpdateResponse = {
  event: "UPSERT";
  conversation: ConversationResponse;
};

export type DailyTopicResponse = {
  groupId: number;
  topicId: number;
  topicDate: string;
  title: string;
  content: string;
};

export type UserStreakResponse = {
  userId: number;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
  todayMessageCount: number;
};

export type GroupStreakResponse = {
  groupId: number;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
  todayMessageCount: number;
  todayActiveMemberCount: number;
  todayStreakCounted: boolean;
};
