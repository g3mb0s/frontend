import { authFetch } from "@/lib/auth/auth-fetch";
import type {
  SrsCardState,
  SrsCategory,
  SrsPreferences,
  SrsStats,
  SrsWord,
  SrsWordStatus,
  WordListResult,
} from "./types";

const API = "/api/srs";

export async function getNewWords(limit = 10): Promise<SrsWord[]> {
  const response = await read<{ items: SrsWord[] }>(await authFetch(`${API}/words/new?limit=${limit}`));
  return response.items;
}

export async function getUserWords(
  params: { status?: SrsWordStatus; errors_only?: boolean; limit?: number; offset?: number } = {},
): Promise<WordListResult> {
  const search = new URLSearchParams();
  if (params.status !== undefined) search.set("status", params.status);
  if (params.errors_only !== undefined) search.set("errors_only", String(params.errors_only));
  if (params.limit !== undefined) search.set("limit", String(params.limit));
  if (params.offset !== undefined) search.set("offset", String(params.offset));
  const query = search.toString();
  return read<WordListResult>(await authFetch(`${API}/words${query ? `?${query}` : ""}`));
}

export async function getDueWords(limit = 10): Promise<SrsWord[]> {
  const response = await read<{ items: SrsWord[] }>(await authFetch(`${API}/words/review?limit=${limit}`));
  return response.items;
}

export async function getWordStats(): Promise<SrsStats> {
  return read<SrsStats>(await authFetch(`${API}/words/stats`));
}

export async function startWord(wordId: string): Promise<SrsCardState> {
  const response = await read<{ card: SrsCardState }>(
    await authFetch(`${API}/words/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ word_id: wordId }),
    }),
  );
  return response.card;
}

export async function answerWord(wordId: string, remembered: boolean): Promise<SrsCardState> {
  const response = await read<{ card: SrsCardState }>(
    await authFetch(`${API}/words/${wordId}/review`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ remembered }),
    }),
  );
  return response.card;
}

export async function markWordKnown(wordId: string): Promise<SrsCardState> {
  const response = await read<{ card: SrsCardState }>(
    await authFetch(`${API}/words/${wordId}/known`, { method: "POST" }),
  );
  return response.card;
}

export async function listSrsCategories(): Promise<SrsCategory[]> {
  const response = await read<{ items: SrsCategory[] }>(await authFetch(`${API}/categories`));
  return response.items;
}

export async function getPreferences(): Promise<string[]> {
  const response = await read<SrsPreferences>(await authFetch(`${API}/preferences`));
  return response.category_slugs;
}

export async function savePreferences(categorySlugs: string[]): Promise<string[]> {
  const response = await read<SrsPreferences>(
    await authFetch(`${API}/preferences`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category_slugs: categorySlugs }),
    }),
  );
  return response.category_slugs;
}

async function read<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const payload = await response.json().catch(() => ({})) as { message?: string | string[] };
    throw new Error(Array.isArray(payload.message) ? payload.message.join(", ") : payload.message ?? "Не удалось выполнить запрос");
  }
  return response.json() as Promise<T>;
}
