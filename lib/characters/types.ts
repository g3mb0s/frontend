export interface CharacterDefinition {
  id: string;
  name: string;
  description: string;
  greeting: string;
  avatar_url: string | null;
}

export interface ManagedCharacter extends CharacterDefinition {
  instructions: string | null;
  character_prompt: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CharacterInput {
  id: string;
  name: string;
  description: string;
  greeting: string;
  character_prompt: string;
  is_active: boolean;
}

export interface CharacterMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  quality: number | null;
  correction: string | null;
  comment: string | null;
  created_at: string;
}

export interface CharacterConversationSummary {
  id: string;
  character_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface CharacterConversation extends CharacterConversationSummary {
  messages: CharacterMessage[];
}

export interface CharacterTurn {
  conversation_id: string;
  user_message: CharacterMessage;
  assistant_message: CharacterMessage;
}

export const CHARACTER_DISCLAIMER =
  "These characters are fictional AI personas for English practice, not real people or their representatives.";
