import { authFetch } from "@/lib/auth/auth-fetch";
import { readAiJson } from "@/lib/ai/api";
import type {
  CharacterConversation,
  CharacterConversationSummary,
  CharacterDefinition,
  CharacterInput,
  ManagedCharacter,
  CharacterTurn,
} from "./types";

const API = "/api/ai";

export async function listCharacters(): Promise<CharacterDefinition[]> {
  return readAiJson<CharacterDefinition[]>(await authFetch(`${API}/characters`));
}

export async function listManagedCharacters(
  query = "",
): Promise<ManagedCharacter[]> {
  const characters = await readAiJson<ManagedCharacter[]>(
    await authFetch(`${API}/admin/characters`),
  );
  const normalizedQuery = query.trim().toLocaleLowerCase();
  if (!normalizedQuery) return characters;
  return characters.filter(
    (character) =>
      character.name.toLocaleLowerCase().includes(normalizedQuery) ||
      character.id.toLocaleLowerCase().includes(normalizedQuery),
  );
}

export async function getManagedCharacter(
  characterId: string,
): Promise<ManagedCharacter> {
  return readAiJson<ManagedCharacter>(
    await authFetch(
      `${API}/admin/characters/${encodeURIComponent(characterId)}`,
    ),
  );
}

export async function createCharacter(
  input: CharacterInput,
): Promise<ManagedCharacter> {
  return readAiJson<ManagedCharacter>(
    await authFetch(`${API}/admin/characters`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }),
  );
}

export async function updateCharacter(
  characterId: string,
  input: Omit<CharacterInput, "id">,
): Promise<ManagedCharacter> {
  return readAiJson<ManagedCharacter>(
    await authFetch(
      `${API}/admin/characters/${encodeURIComponent(characterId)}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      },
    ),
  );
}

export async function deleteCharacter(characterId: string): Promise<void> {
  const response = await authFetch(
    `${API}/admin/characters/${encodeURIComponent(characterId)}`,
    { method: "DELETE" },
  );
  if (!response.ok) await readAiJson<never>(response);
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
