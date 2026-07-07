"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { AuthUserResponse } from "@/features/auth/types";
import { getGroupMessages, sendGroupMessage } from "@/features/chat/api/chat-api";
import { subscribeToGroupMessages } from "@/features/chat/realtime/group-message-subscription";
import {
  createOptimisticMessage,
  type LocalChatMessage,
} from "@/features/chat/utils/optimistic-message";
import type { Dictionary } from "@/i18n/types";
import { getAccessToken } from "@/shared/auth/session";
import { StompClient } from "@/shared/realtime/stomp";

export type SocketStatus = "idle" | "connecting" | "connected" | "error";

export function useChatRoom({
  currentUser,
  dictionary,
  groupId,
}: {
  currentUser: AuthUserResponse | null;
  dictionary: Dictionary;
  groupId: number;
}) {
  const copy = dictionary.chat;
  const [messages, setMessages] = useState<LocalChatMessage[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [socketStatus, setSocketStatus] = useState<SocketStatus>("idle");
  const [socketError, setSocketError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const stompClientRef = useRef<StompClient | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const accessToken = useMemo(() => getAccessToken(), []);

  useEffect(() => {
    let active = true;
    const client = accessToken ? new StompClient(accessToken) : null;
    stompClientRef.current = client;

    async function loadHistoryAndConnect() {
      try {
        setLoading(true);
        setError(null);
        const history = await getGroupMessages(groupId);
        if (active) {
          setMessages(history.messages);
        }

        if (!client) {
          if (active) {
            setSocketStatus("error");
            setSocketError(copy.realtimeSignInRequired);
          }
          return;
        }

        if (active) {
          setSocketStatus("connecting");
          setSocketError(null);
        }

        await client.connect();
        if (!active) return;

        setSocketStatus("connected");
        unsubscribeRef.current = subscribeToGroupMessages({
          client,
          groupId,
          invalidDataMessage: copy.invalidChatData,
          onInvalidData: setSocketError,
          setMessages,
          unknownErrorMessage: copy.unknownSocketError,
        });
      } catch (err) {
        if (active) {
          const message = err instanceof Error ? err.message : copy.loadMessagesError;
          if (message.toLowerCase().includes("websocket")) {
            setSocketStatus("error");
            setSocketError(message);
          } else {
            setError(message);
          }
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadHistoryAndConnect();

    return () => {
      active = false;
      unsubscribeRef.current?.();
      unsubscribeRef.current = null;
      stompClientRef.current?.disconnect();
      stompClientRef.current = null;
    };
  }, [
    accessToken,
    copy.invalidChatData,
    copy.loadMessagesError,
    copy.realtimeSignInRequired,
    copy.unknownSocketError,
    groupId,
  ]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  async function sendMessage() {
    const trimmed = content.trim();
    if (!trimmed) return;

    const optimisticMessage = createOptimisticMessage({
      content: trimmed,
      currentUser,
      fallbackSenderName: dictionary.common.you,
      groupId,
    });
    setMessages((previousMessages) => [...previousMessages, optimisticMessage]);
    setContent("");

    try {
      if (stompClientRef.current && socketStatus === "connected") {
        stompClientRef.current.send(`/app/groups/${groupId}/messages`, {
          content: trimmed,
        });
      } else {
        const newMessage = await sendGroupMessage(groupId, trimmed);
        setMessages((previousMessages) =>
          previousMessages.map((message) =>
            message.messageId === optimisticMessage.messageId ? newMessage : message,
          ),
        );
      }
    } catch (err) {
      setMessages((previousMessages) =>
        previousMessages.filter((message) => message.messageId !== optimisticMessage.messageId),
      );
      setContent(trimmed);
      setSocketError(err instanceof Error ? err.message : copy.sendMessageError);
    }
  }

  return {
    bottomRef,
    content,
    error,
    loading,
    messages,
    sendMessage,
    setContent,
    socketError,
    socketStatus,
  };
}
