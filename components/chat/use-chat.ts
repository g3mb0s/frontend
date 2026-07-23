"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  createConversation,
  getConversation,
  listConversations,
  streamChatMessage,
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
  const activeSend = useRef(0);
  const streamController = useRef<AbortController | null>(null);

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

  useEffect(() => {
    return () => streamController.current?.abort();
  }, []);

  const selectConversation = useCallback(async (id: string) => {
    activeSend.current += 1;
    streamController.current?.abort();
    streamController.current = null;
    setIsSending(false);
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
    activeSend.current += 1;
    streamController.current?.abort();
    streamController.current = null;
    setIsSending(false);
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
    const sendId = ++activeSend.current;
    const controller = new AbortController();
    streamController.current = controller;

    const optimisticId = `optimistic-${Date.now()}`;
    const streamingId = `streaming-${Date.now()}`;
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

      let streamedContent = "";
      const turn = await streamChatMessage(
        conversationId,
        content,
        (delta) => {
          if (activeSend.current !== sendId) return;
          streamedContent += delta;
          setMessages((current) => {
            const streamingMessage = current.find((message) => message.id === streamingId);
            if (streamingMessage) {
              return current.map((message) =>
                message.id === streamingId
                  ? { ...message, content: streamedContent }
                  : message,
              );
            }
            return [
              ...current,
              {
                id: streamingId,
                role: "assistant",
                content: streamedContent,
                provider: null,
                model: null,
                created_at: new Date().toISOString(),
              },
            ];
          });
        },
        controller.signal,
      );
      if (activeSend.current !== sendId) return true;
      setMessages((current) => [
        ...current.filter((message) =>
          message.id !== optimisticId && message.id !== streamingId
        ),
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
      if (requestError instanceof DOMException && requestError.name === "AbortError") {
        return true;
      }
      if (activeSend.current !== sendId) return true;
      setMessages((current) => current.filter((message) =>
        message.id !== optimisticId && message.id !== streamingId
      ));
      setError(requestError instanceof Error ? requestError.message : "Не удалось отправить сообщение");
      return false;
    } finally {
      if (activeSend.current === sendId) {
        setIsSending(false);
        streamController.current = null;
      }
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
