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
  sentAt: string;
};

export type HistoryResponse = {
  groupId: number;
  messages: ChatMessage[];
};
