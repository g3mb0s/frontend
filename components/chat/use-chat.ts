"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  createConversation,
  getConversation,
  listConversations,
  streamChatMessage,
  streamToolChatMessage,
} from "@/lib/ai/api";
import type { ChatMessage, ConversationSummary } from "@/lib/ai/types";
import { getUserWords } from "@/lib/srs/api";
import type { SrsWord, SrsWordStatus, WordListResult } from "@/lib/srs/types";
import { conversationTitle } from "./model";

type LoadState = "loading" | "ready" | "error";

export interface ActiveToolState {
  id: string;
  name: string;
  note: string;
  status: "executing" | "done" | "error";
  error?: string;
  wordCount?: number;
  words?: SrsWord[];
}

const WORD_STATUSES: SrsWordStatus[] = [
  "new",
  "learning",
  "single_review",
  "recent",
  "due",
  "learned",
  "long_learned",
  "known",
];

function isWordStatus(value: unknown): value is SrsWordStatus {
  return typeof value === "string" && WORD_STATUSES.includes(value as SrsWordStatus);
}

export function useChat() {
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [listState, setListState] = useState<LoadState>("loading");
  const [messageState, setMessageState] = useState<LoadState>("ready");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<ActiveToolState | null>(null);
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
    setActiveTool(null);
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
    setActiveTool(null);
    activeLoad.current += 1;
    setActiveId(null);
    setMessages([]);
    setError(null);
    setMessageState("ready");
  }, []);

  const runToolPhase = async (args: {
    sendId: number;
    conversationId: string;
    optimisticId: string;
    streamingId: string;
    content: string;
    result: { id: string; name: string; arguments: string; note: string };
    controller: AbortController;
  }): Promise<boolean> => {
    const { sendId, conversationId, optimisticId, streamingId, content, result, controller } = args;
    setActiveTool({
      id: result.id,
      name: result.name,
      note: result.note,
      status: "executing",
    });

    // JSON.parse аргументов один раз; при ошибке парсинга карточка показывает
    // аргументы как текст, а фаза 2 всё равно отправляется.
    let parsedArguments: Record<string, unknown> | null = null;
    try {
      parsedArguments = JSON.parse(result.arguments) as Record<string, unknown>;
    } catch {
      parsedArguments = null;
    }

    const wordParams: { status?: SrsWordStatus; errors_only?: boolean; limit?: number; offset?: number } = {};
    if (parsedArguments) {
      if (isWordStatus(parsedArguments.status)) wordParams.status = parsedArguments.status;
      if (typeof parsedArguments.errors_only === "boolean") wordParams.errors_only = parsedArguments.errors_only;
      if (typeof parsedArguments.limit === "number") wordParams.limit = parsedArguments.limit;
      if (typeof parsedArguments.offset === "number") wordParams.offset = parsedArguments.offset;
    }

    let wordResult: WordListResult;
    try {
      wordResult = await getUserWords(wordParams);
    } catch (requestError) {
      if (requestError instanceof DOMException && requestError.name === "AbortError") {
        setActiveTool(null);
        return true;
      }
      // Фаза 2 при ошибке тула не запускается: пробрасываем ошибку, чтобы
      // внешний catch в sendMessage убрал оптимистичные сообщения и сбросил
      // isSending/activeTool, иначе UI расходится с БД до перезагрузки.
      throw requestError;
    }
    if (activeSend.current !== sendId) return true;

    setActiveTool((current) =>
      current?.id === result.id
        ? {
            ...current,
            status: "done",
            wordCount: wordResult.total,
            words: wordResult.items.slice(0, 5),
          }
        : current,
    );

    let streamedContent = "";
    const toolTurn = await streamToolChatMessage(
      conversationId,
      result.id,
      JSON.stringify(wordResult),
      (delta) => {
        if (activeSend.current !== sendId) return;
        streamedContent += delta;
        setMessages((current) => {
          const streamingMessage = current.find((message) => message.id === streamingId);
          if (streamingMessage) {
            return current.map((message) =>
              message.id === streamingId
                ? { ...message, content: (streamingMessage.content ?? "") + delta }
                : message,
            );
          }
          return [
            ...current,
            {
              id: streamingId,
              role: "assistant" as const,
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

    setActiveTool(null);
    setMessages((current) => [
      ...current.filter((message) =>
        message.id !== optimisticId && message.id !== streamingId
      ),
      toolTurn.user_message,
      toolTurn.assistant_message,
    ]);
    setConversations((current) =>
      current.map((conversation) =>
        conversation.id === conversationId
          ? {
              ...conversation,
              title: conversationTitle(content),
              updated_at: toolTurn.assistant_message.created_at,
            }
          : conversation,
      ),
    );
    return true;
  };

  const sendMessage = useCallback(async (rawContent: string) => {
    const content = rawContent.trim();
    if (!content || isSending) return false;

    setIsSending(true);
    setError(null);
    setActiveTool(null);
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
      const updateStreaming = (delta: string) => {
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
              role: "assistant" as const,
              content: streamedContent,
              provider: null,
              model: null,
              created_at: new Date().toISOString(),
            },
          ];
        });
      };

      const result = await streamChatMessage(
        conversationId,
        content,
        updateStreaming,
        controller.signal,
      );
      if (activeSend.current !== sendId) return true;

      if (result.kind === "tool_call") {
        return await runToolPhase({
          sendId,
          conversationId,
          optimisticId,
          streamingId,
          content,
          result,
          controller,
        });
      }

      setMessages((current) => [
        ...current.filter((message) =>
          message.id !== optimisticId && message.id !== streamingId
        ),
        result.turn.user_message,
        result.turn.assistant_message,
      ]);
      setConversations((current) =>
        current.map((conversation) =>
          conversation.id === conversationId
            ? {
                ...conversation,
                title: conversationTitle(content),
                updated_at: result.turn.assistant_message.created_at,
              }
            : conversation,
        ),
      );
      return true;
    } catch (requestError) {
      if (requestError instanceof DOMException && requestError.name === "AbortError") {
        setActiveTool(null);
        return true;
      }
      if (activeSend.current !== sendId) return true;
      setMessages((current) => current.filter((message) =>
        message.id !== optimisticId && message.id !== streamingId
      ));
      setError(requestError instanceof Error ? requestError.message : "Не удалось отправить сообщение");
      setActiveTool(null);
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
    activeTool,
    loadConversations,
    selectConversation,
    startNewConversation,
    sendMessage,
  };
}
