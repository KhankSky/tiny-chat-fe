"use client";

import { useEffect, useState } from "react";
import { getConversations } from "@/features/chat/api/chat-api";
import type { ConversationResponse } from "@/features/chat/types";

export function useConversationList(loadErrorFallback: string) {
  const [conversations, setConversations] = useState<ConversationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadConversations() {
      try {
        setLoading(true);
        const data = await getConversations();
        if (active) {
          setConversations(data);
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : loadErrorFallback);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadConversations();

    return () => {
      active = false;
    };
  }, [loadErrorFallback]);

  return { conversations, error, loading };
}
