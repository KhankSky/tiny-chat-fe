export type ConversationResponse = {
  conversationId: number;
  groupId: number;
  title: string;
  description: string | null;
  avatarUrl: string | null;
  lastMessage: string | null;
  lastMessageAt: string | null;
  memberCount: number;
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
};

export type HistoryResponse = {
  groupId: number;
  messages: ChatMessage[];
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
