import type { ExerciseInput, ExerciseType } from "@/lib/content/types";

export const exerciseTypes: { value: ExerciseType; label: string }[] = [
  { value: "fill_gap_choice", label: "Выбор пропуска" },
  { value: "fill_gap_input", label: "Ввод пропуска" },
  { value: "matching", label: "Сопоставление" },
  { value: "sentence_from_audio", label: "Предложение по аудио" },
  { value: "sentence_from_translation", label: "Предложение по переводу" },
];

export function newExercise(type: ExerciseType): ExerciseInput {
  return { type, title: "", level: "", language: "", tags: [], content: { items: [] }, settings: { shuffleItems: false, shuffleOptions: false, caseSensitive: false }, scoring: { mode: "per_item", maxScore: 1 }, metadata: { version: 1, status: "draft" } };
}

export function fillGapItem(type: "fill_gap_choice" | "fill_gap_input", index: number) {
  const gap = type === "fill_gap_choice" ? { key: "", options: [], answers: [] } : { key: "", answers: [], acceptedAnswers: [] };
  return { id: uniqueId(`item-${index + 1}`), text: "", gaps: [gap] };
}

export function matchingItem(index: number) {
  return { id: uniqueId(`matching-${index}`), left: [], right: [], pairs: [] };
}

export function sentenceItem(type: "sentence_from_audio" | "sentence_from_translation") {
  return { ...(type === "sentence_from_audio" ? { audio: { url: "" } } : { translation: { ru: "" } }), words: [], answer: [] };
}

export function uniqueId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function objectList(value: unknown) {
  return Array.isArray(value) ? value as Record<string, unknown>[] : [];
}

export function stringList(value: unknown) {
  return Array.isArray(value) ? value.join(", ") : "";
}
