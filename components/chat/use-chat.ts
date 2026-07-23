"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  createConversation,
  getConversation,
  listConversations,
  sendChatMessage,
} from "@/lib/ai/api";
import type { ChatMessage, ConversationSummary } from "@/lib/ai/types";
import { conversationTitle } from "./model";

type LoadState = "loading" | "ready" | "error";

export function useChat() {
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [listState, setListState] = useState<LoadState>("loading");
  const [messageState, setMessageState] = useState<LoadState>("ready");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const activeLoad = useRef(0);

  const loadConversations = useCallback(async () => {
    setListState("loading");
    try {
      const items = await listConversations();
      setConversations(items);
      setListState("ready");
    } catch {
      setListState("error");
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadConversations();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadConversations]);

  const selectConversation = useCallback(async (id: string) => {
    const loadId = ++activeLoad.current;
    setActiveId(id);
    setMessages([]);
    setError(null);
    setMessageState("loading");

    try {
      const conversation = await getConversation(id);
      if (activeLoad.current !== loadId) return;
      setMessages(conversation.messages);
      setMessageState("ready");
    } catch (requestError) {
      if (activeLoad.current !== loadId) return;
      setError(requestError instanceof Error ? requestError.message : "Не удалось загрузить диалог");
      setMessageState("error");
    }
  }, []);

  const startNewConversation = useCallback(() => {
    activeLoad.current += 1;
    setActiveId(null);
    setMessages([]);
    setError(null);
    setMessageState("ready");
  }, []);

  const sendMessage = useCallback(async (rawContent: string) => {
    const content = rawContent.trim();
    if (!content || isSending) return false;

    setIsSending(true);
    setError(null);

    const optimisticId = `optimistic-${Date.now()}`;
    const optimisticMessage: ChatMessage = {
      id: optimisticId,
      role: "user",
      content,
      provider: null,
      model: null,
      created_at: new Date().toISOString(),
    };
    setMessages((current) => [...current, optimisticMessage]);

    try {
      let conversationId = activeId;
      if (!conversationId) {
        const created = await createConversation();
        conversationId = created.id;
        setActiveId(created.id);
        setConversations((current) => [created, ...current]);
      }

      const turn = await sendChatMessage(conversationId, content);
      setMessages((current) => [
        ...current.filter((message) => message.id !== optimisticId),
        turn.user_message,
        turn.assistant_message,
      ]);
      setConversations((current) =>
        current.map((conversation) =>
          conversation.id === conversationId
            ? {
                ...conversation,
                title: conversationTitle(content),
                updated_at: turn.assistant_message.created_at,
              }
            : conversation,
        ),
      );
      return true;
    } catch (requestError) {
      setMessages((current) => current.filter((message) => message.id !== optimisticId));
      setError(requestError instanceof Error ? requestError.message : "Не удалось отправить сообщение");
      return false;
    } finally {
      setIsSending(false);
    }
  }, [activeId, isSending]);

  return {
    conversations,
    activeId,
    messages,
    listState,
    messageState,
    isSending,
    error,
    loadConversations,
    selectConversation,
    startNewConversation,
    sendMessage,
  };
}
