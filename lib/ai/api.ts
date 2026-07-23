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
  return readAiJson<ConversationSummary[]>(await authFetch(`${AI_API}/chat/conversations`));
}

export async function getConversation(id: string): Promise<Conversation> {
  return readAiJson<Conversation>(
    await authFetch(`${AI_API}/chat/conversations/${encodeURIComponent(id)}`),
  );
}

export async function createConversation(): Promise<ConversationSummary> {
  return readAiJson<ConversationSummary>(
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
  return readAiJson<ChatTurn>(
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

export async function streamChatMessage(
  conversationId: string,
  content: string,
  onDelta: (delta: string) => void,
  signal?: AbortSignal,
): Promise<ChatTurn> {
  const response = await authFetch(
    `${AI_API}/chat/conversations/${encodeURIComponent(conversationId)}/messages/stream`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
      signal,
    },
  );
  if (!response.ok) return readAiJson<ChatTurn>(response);
  if (!response.body) throw new Error("Браузер не поддерживает потоковые ответы");

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let turn: ChatTurn | null = null;

  try {
    while (true) {
      const { value, done } = await reader.read();
      buffer += decoder.decode(value, { stream: !done }).replace(/\r\n/g, "\n");

      let boundary = buffer.indexOf("\n\n");
      while (boundary !== -1) {
        const block = buffer.slice(0, boundary);
        buffer = buffer.slice(boundary + 2);
        const event = parseSseEvent(block);

        if (event.type === "delta") {
          const payload = JSON.parse(event.data) as { delta?: string };
          if (payload.delta) onDelta(payload.delta);
        } else if (event.type === "done") {
          turn = JSON.parse(event.data) as ChatTurn;
        } else if (event.type === "error") {
          const payload = JSON.parse(event.data) as { message?: string };
          throw new Error(payload.message || "Потоковый ответ ИИ завершился с ошибкой");
        }

        boundary = buffer.indexOf("\n\n");
      }

      if (done) break;
    }
  } finally {
    reader.releaseLock();
  }

  if (!turn) throw new Error("ИИ не завершил потоковый ответ");
  return turn;
}

export async function generateExercise(
  input: GenerateExerciseRequest,
): Promise<ExerciseGeneration> {
  return readAiJson<ExerciseGeneration>(
    await authFetch(`${AI_API}/exercises/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }),
  );
}

function parseSseEvent(block: string) {
  let type = "message";
  const data: string[] = [];
  for (const line of block.split("\n")) {
    if (line.startsWith("event:")) type = line.slice(6).trim();
    if (line.startsWith("data:")) data.push(line.slice(5).trimStart());
  }
  return { type, data: data.join("\n") };
}

export async function readAiJson<T>(response: Response): Promise<T> {
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
