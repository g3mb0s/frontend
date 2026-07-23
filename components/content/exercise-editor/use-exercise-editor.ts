"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createExercise, getManagedExercise, updateExercise } from "@/lib/content/api";
import { generateExercise } from "@/lib/ai/api";
import type { ExerciseInput, ExerciseType } from "@/lib/content/types";
import { splitList } from "@/lib/utils/collections";
import { buildGenerationRequest, newExercise, type AiExerciseForm } from "./model";

export function useExerciseEditor(exerciseId?: string) {
  const router = useRouter();
  const [exercise, setExercise] = useState<ExerciseInput>(() => newExercise("fill_gap_choice"));
  const [tags, setTags] = useState("");
  const [loading, setLoading] = useState(Boolean(exerciseId));
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [aiOpen, setAiOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  useEffect(() => {
    if (!exerciseId) return;
    void getManagedExercise(exerciseId)
      .then((value) => {
        setExercise({ type: value.type, title: value.title ?? "", level: value.level ?? "", language: value.language ?? "", tags: value.tags, content: value.payload.content, settings: value.payload.settings ?? {}, scoring: value.payload.scoring, metadata: value.payload.metadata });
        setTags(value.tags.join(", "));
      })
      .catch((error: Error) => setMessage(error.message))
      .finally(() => setLoading(false));
  }, [exerciseId]);

  function updateExerciseState(patch: Partial<ExerciseInput>) {
    setExercise((current) => ({ ...current, ...patch }));
  }

  function changeType(type: ExerciseType) {
    setExercise((current) => ({ ...current, type, content: newExercise(type).content }));
  }

  async function save() {
    setSaving(true);
    setMessage(null);
    try {
      const input = { ...exercise, tags: splitList(tags) };
      const saved = exerciseId ? await updateExercise(exerciseId, input) : await createExercise(input);
      if (exerciseId) setMessage("Изменения сохранены");
      else router.replace(`/admin/exercises/${saved.id}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Не удалось сохранить упражнение");
    } finally {
      setSaving(false);
    }
  }

  function openAiGenerator() {
    setGenerationError(null);
    setAiOpen(true);
  }

  function closeAiGenerator() {
    if (!generating) setAiOpen(false);
  }

  async function generateWithAi(form: AiExerciseForm) {
    setGenerating(true);
    setGenerationError(null);
    try {
      const generation = await generateExercise(buildGenerationRequest(form));
      const generated = generation.exercises[0];
      if (!generated) throw new Error("ИИ не вернул упражнение");

      setExercise(generated);
      setTags(generated.tags.join(", "));
      setMessage(null);
      setAiOpen(false);
    } catch (error) {
      setGenerationError(error instanceof Error ? error.message : "Не удалось сгенерировать упражнение");
    } finally {
      setGenerating(false);
    }
  }

  return {
    exercise,
    tags,
    loading,
    saving,
    preview,
    message,
    aiOpen,
    generating,
    generationError,
    setTags,
    setPreview,
    updateExercise: updateExerciseState,
    changeType,
    openAiGenerator,
    closeAiGenerator,
    generateWithAi,
    save,
  };
}
