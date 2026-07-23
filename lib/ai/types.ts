import type { ExerciseInput, ExerciseType } from "@/lib/content/types";

export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  provider: string | null;
  model: string | null;
  created_at: string;
}

export interface ConversationSummary {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface Conversation extends ConversationSummary {
  messages: ChatMessage[];
}

export interface ChatTurn {
  conversation_id: string;
  user_message: ChatMessage;
  assistant_message: ChatMessage;
}

export interface GenerateExerciseRequest {
  topic: string;
  level: string;
  exercise_type: ExerciseType;
  count: number;
  tags: string[];
  extra_instructions: string | null;
  audio_url: string | null;
}

export interface ExerciseGeneration {
  id: string;
  topic: string;
  level: string;
  exercise_type: ExerciseType;
  exercises: ExerciseInput[];
  provider: string;
  model: string;
  created_at: string;
}
