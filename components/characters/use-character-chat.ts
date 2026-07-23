"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  createCharacterConversation,
  getCharacterConversation,
  listCharacterConversations,
  listCharacters,
  sendCharacterMessage,
} from "@/lib/characters/api";
import type {
  CharacterConversationSummary,
  CharacterDefinition,
  CharacterMessage,
} from "@/lib/characters/types";

type LoadState = "loading" | "ready" | "error";

export function useCharacterChat(characterId: string) {
  const [character, setCharacter] = useState<CharacterDefinition | null>(null);
  const [conversations, setConversations] = useState<CharacterConversationSummary[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<CharacterMessage[]>([]);
  const [state, setState] = useState<LoadState>("loading");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const activeLoad = useRef(0);

  const selectConversation = useCallback(async (id: string) => {
    const loadId = ++activeLoad.current;
    setActiveId(id);
    setMessages([]);
    setError(null);
    try {
      const conversation = await getCharacterConversation(id);
      if (activeLoad.current !== loadId) return;
      setMessages(conversation.messages);
    } catch (requestError) {
      if (activeLoad.current !== loadId) return;
      setError(requestError instanceof Error ? requestError.message : "Could not load this chat");
    }
  }, []);

  const load = useCallback(async () => {
    setState("loading");
    try {
      const [characters, items] = await Promise.all([
        listCharacters(),
        listCharacterConversations(characterId),
      ]);
      const selectedCharacter = characters.find((item) => item.id === characterId);
      if (!selectedCharacter) throw new Error("Character not found");
      setCharacter(selectedCharacter);
      setConversations(items);
      setState("ready");
      if (items[0]) await selectConversation(items[0].id);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not load the character");
      setState("error");
    }
  }, [characterId, selectConversation]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timeoutId);
  }, [load]);

  const startNew = useCallback(() => {
    activeLoad.current += 1;
    setActiveId(null);
    setMessages([]);
    setError(null);
  }, []);

  const send = useCallback(async (rawContent: string) => {
    const content = rawContent.trim();
    if (!content || sending) return false;

    setSending(true);
    setError(null);
    const optimisticId = `character-user-${Date.now()}`;
    const optimistic: CharacterMessage = {
      id: optimisticId,
      role: "user",
      content,
      quality: null,
      correction: null,
      comment: null,
      created_at: new Date().toISOString(),
    };
    setMessages((current) => [...current, optimistic]);

    try {
      let conversationId = activeId;
      if (!conversationId) {
        const created = await createCharacterConversation(characterId);
        conversationId = created.id;
        setActiveId(created.id);
        setConversations((current) => [created, ...current]);
      }
      const turn = await sendCharacterMessage(conversationId, content);
      setMessages((current) => [
        ...current.filter((message) => message.id !== optimisticId),
        turn.user_message,
        turn.assistant_message,
      ]);
      setConversations((current) => current.map((conversation) =>
        conversation.id === conversationId
          ? { ...conversation, title: content.slice(0, 80), updated_at: turn.assistant_message.created_at }
          : conversation
      ));
      return true;
    } catch (requestError) {
      setMessages((current) => current.filter((message) => message.id !== optimisticId));
      setError(requestError instanceof Error ? requestError.message : "Could not send your message");
      return false;
    } finally {
      setSending(false);
    }
  }, [activeId, characterId, sending]);

  return {
    character,
    conversations,
    activeId,
    messages,
    state,
    sending,
    error,
    load,
    selectConversation,
    startNew,
    send,
  };
}
