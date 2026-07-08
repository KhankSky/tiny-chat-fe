export type FriendshipStatus =
  | "SELF"
  | "NONE"
  | "OUTGOING_PENDING"
  | "INCOMING_PENDING"
  | "FRIEND";

export type FriendRequestStatus = "PENDING" | "ACCEPTED" | "CANCELED" | "REJECTED";

export type FriendUserSummary = {
  userId: number;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  directConversationId: number | null;
};

export type FriendProfileResponse = {
  userId: number;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  englishLevel: string | null;
  practiceGoal: string | null;
  interests: string[] | null;
  bio: string | null;
  friendshipStatus: FriendshipStatus;
  incomingRequestId: number | null;
  outgoingRequestId: number | null;
  directConversationId: number | null;
};

export type FriendRequestResponse = {
  requestId: number;
  status: FriendRequestStatus;
  sender: FriendUserSummary;
  receiver: FriendUserSummary;
  directConversationId: number | null;
  createdAt: string | null;
  updatedAt: string | null;
};

export type DirectConversationResponse = {
  conversationId: number;
  groupId: number;
};
