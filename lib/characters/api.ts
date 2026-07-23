import { authFetch } from "@/lib/auth/auth-fetch";
import { readAiJson } from "@/lib/ai/api";
import type {
  CharacterConversation,
  CharacterConversationSummary,
  CharacterDefinition,
  CharacterTurn,
} from "./types";

const API = "/api/ai";

export async function listCharacters(): Promise<CharacterDefinition[]> {
  return readAiJson<CharacterDefinition[]>(await authFetch(`${API}/characters`));
}

export async function listCharacterConversations(
  characterId: string,
): Promise<CharacterConversationSummary[]> {
  return readAiJson<CharacterConversationSummary[]>(
    await authFetch(
      `${API}/characters/${encodeURIComponent(characterId)}/conversations`,
    ),
  );
}

export async function createCharacterConversation(
  characterId: string,
): Promise<CharacterConversationSummary> {
  return readAiJson<CharacterConversationSummary>(
    await authFetch(
      `${API}/characters/${encodeURIComponent(characterId)}/conversations`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      },
    ),
  );
}

export async function getCharacterConversation(
  conversationId: string,
): Promise<CharacterConversation> {
  return readAiJson<CharacterConversation>(
    await authFetch(
      `${API}/character-conversations/${encodeURIComponent(conversationId)}`,
    ),
  );
}

export async function sendCharacterMessage(
  conversationId: string,
  content: string,
): Promise<CharacterTurn> {
  return readAiJson<CharacterTurn>(
    await authFetch(
      `${API}/character-conversations/${encodeURIComponent(conversationId)}/messages`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      },
    ),
  );
}
