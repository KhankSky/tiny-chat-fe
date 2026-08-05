"use client";

import { useEffect, useMemo, useRef } from "react";

type UnreadConversation = {
  unreadCount?: number;
};

export function useUnreadTabTitle({
  appName,
  conversations,
}: {
  appName: string;
  conversations: readonly UnreadConversation[];
}) {
  const initialTitleRef = useRef<string | null>(null);
  const unreadCount = useMemo(
    () => conversations.reduce((total, conversation) => total + (conversation.unreadCount ?? 0), 0),
    [conversations],
  );

  useEffect(() => {
    initialTitleRef.current = document.title;

    return () => {
      if (initialTitleRef.current !== null) {
        document.title = initialTitleRef.current;
      }
    };
  }, []);

  useEffect(() => {
    document.title = unreadCount > 0 ? `(${unreadCount}) ${appName}` : appName;
  }, [appName, unreadCount]);
}
