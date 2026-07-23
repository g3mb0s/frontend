"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/form-controls";
import { Modal } from "@/components/ui/modal";
import type { ExerciseInput, ExerciseType } from "@/lib/content/types";
import { exerciseTypes, type AiExerciseForm } from "./model";

interface AiGeneratorModalProps {
  exercise: ExerciseInput;
  tags: string;
  generating: boolean;
  error: string | null;
  onClose: () => void;
  onGenerate: (form: AiExerciseForm) => Promise<void>;
}

export function AiGeneratorModal({
  exercise,
  tags,
  generating,
  error,
  onClose,
  onGenerate,
}: AiGeneratorModalProps) {
  const [form, setForm] = useState<AiExerciseForm>({
    topic: exercise.title,
    type: exercise.type,
    level: exercise.level || "A1",
    itemCount: 5,
    tags,
    instructions: "",
    audioUrl: "",
  });

  const update = (patch: Partial<AiExerciseForm>) =>
    setForm((current) => ({ ...current, ...patch }));

  const valid = form.topic.trim()
    && form.level.trim()
    && (form.type !== "sentence_from_audio" || form.audioUrl.trim());

  function submit(event: FormEvent) {
    event.preventDefault();
    if (valid && !generating) void onGenerate(form);
  }

  return (
    <Modal
      title="Создать упражнение с ИИ"
      eyebrow="Gembos AI"
      onClose={onClose}
      className="max-w-2xl"
    >
      <form onSubmit={submit}>
        <p className="-mt-2 mb-6 text-sm leading-6 text-slate-500">
          Опишите результат, а ИИ заполнит поля редактора. Перед сохранением всё можно проверить и изменить.
        </p>

        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Тема упражнения" className="md:col-span-2">
            <Input
              value={form.topic}
              maxLength={300}
              required
              autoFocus
              placeholder="Например, Present Simple в повседневных ситуациях"
              onChange={(event) => update({ topic: event.target.value })}
            />
          </Field>
          <Field label="Тип упражнения">
            <Select
              value={form.type}
              onChange={(event) => update({ type: event.target.value as ExerciseType })}
            >
              {exerciseTypes.map((type) => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </Select>
          </Field>
          <Field label="Уровень">
            <Select value={form.level} onChange={(event) => update({ level: event.target.value })}>
              {["A1", "A2", "B1", "B2", "C1", "C2"].map((level) => (
                <option key={level} value={level}>{level}</option>
              ))}
            </Select>
          </Field>
          <Field label="Количество заданий">
            <Input
              type="number"
              min={1}
              max={10}
              value={form.itemCount}
              onChange={(event) => update({ itemCount: Math.min(10, Math.max(1, Number(event.target.value))) })}
            />
          </Field>
          <Field label="Теги через запятую">
            <Input
              value={form.tags}
              placeholder="grammar, present-simple"
              onChange={(event) => update({ tags: event.target.value })}
            />
          </Field>
          {form.type === "sentence_from_audio" && (
            <Field label="URL аудио" className="md:col-span-2">
              <Input
                type="url"
                value={form.audioUrl}
                required
                maxLength={2000}
                placeholder="https://example.com/audio.mp3"
                onChange={(event) => update({ audioUrl: event.target.value })}
              />
            </Field>
          )}
          <Field label="Описание и дополнительные требования" className="md:col-span-2">
            <Textarea
              value={form.instructions}
              maxLength={1800}
              className="min-h-32"
              placeholder="Например: используй бытовую лексику, короткие предложения и добавь похожие варианты ответа"
              onChange={(event) => update({ instructions: event.target.value })}
            />
          </Field>
        </div>

        {error && (
          <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
            {error}
          </div>
        )}

        <div className="mt-7 flex items-center justify-end gap-3 border-t border-slate-100 pt-5">
          <Button disabled={generating} onClick={onClose}>Отмена</Button>
          <Button type="submit" variant="primary" disabled={!valid || generating}>
            {generating ? "Генерируем, это может занять минуту…" : "Сгенерировать и заполнить"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
