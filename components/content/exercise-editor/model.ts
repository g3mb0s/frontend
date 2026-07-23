import type { ExerciseInput, ExerciseType } from "@/lib/content/types";
import type { GenerateExerciseRequest } from "@/lib/ai/types";

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

export interface AiExerciseForm {
  topic: string;
  type: ExerciseType;
  level: string;
  itemCount: number;
  tags: string;
  instructions: string;
  audioUrl: string;
}

export function buildGenerationRequest(form: AiExerciseForm): GenerateExerciseRequest {
  const itemInstruction = `Создай ${form.itemCount} ${russianTaskCount(form.itemCount)} внутри массива content.items.`;
  const extraInstructions = [itemInstruction, form.instructions.trim()]
    .filter(Boolean)
    .join("\n");

  return {
    topic: form.topic.trim(),
    level: form.level.trim(),
    exercise_type: form.type,
    count: 1,
    tags: form.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
    extra_instructions: extraInstructions,
    audio_url: form.type === "sentence_from_audio" ? form.audioUrl.trim() : null,
  };
}

function russianTaskCount(count: number) {
  if (count === 1) return "задание";
  if (count >= 2 && count <= 4) return "задания";
  return "заданий";
}
