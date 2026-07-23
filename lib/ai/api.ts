import { authFetch } from "@/lib/auth/auth-fetch";
import type {
  ChatTurn,
  Conversation,
  ConversationSummary,
  ExerciseGeneration,
  GenerateExerciseRequest,
} from "./types";

const AI_API = "/api/ai";

export async function listConversations(): Promise<ConversationSummary[]> {
  return readJson<ConversationSummary[]>(await authFetch(`${AI_API}/chat/conversations`));
}

export async function getConversation(id: string): Promise<Conversation> {
  return readJson<Conversation>(
    await authFetch(`${AI_API}/chat/conversations/${encodeURIComponent(id)}`),
  );
}

export async function createConversation(): Promise<ConversationSummary> {
  return readJson<ConversationSummary>(
    await authFetch(`${AI_API}/chat/conversations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    }),
  );
}

export async function sendChatMessage(
  conversationId: string,
  content: string,
): Promise<ChatTurn> {
  return readJson<ChatTurn>(
    await authFetch(
      `${AI_API}/chat/conversations/${encodeURIComponent(conversationId)}/messages`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      },
    ),
  );
}

export async function generateExercise(
  input: GenerateExerciseRequest,
): Promise<ExerciseGeneration> {
  return readJson<ExerciseGeneration>(
    await authFetch(`${AI_API}/exercises/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }),
  );
}

async function readJson<T>(response: Response): Promise<T> {
  if (response.ok) {
    return (await response.json()) as T;
  }

  let message = "Не удалось связаться с ИИ";
  try {
    const payload = (await response.json()) as {
      detail?: string | Array<{ msg?: string }>;
      message?: string | string[];
    };
    if (typeof payload.detail === "string") {
      message = payload.detail;
    } else if (Array.isArray(payload.detail)) {
      message = payload.detail.map((item) => item.msg).filter(Boolean).join(", ") || message;
    } else if (payload.message) {
      message = Array.isArray(payload.message)
        ? payload.message.join(", ")
        : payload.message;
    }
  } catch {
    // Keep a useful fallback for non-JSON upstream errors.
  }

  throw new Error(message);
}
