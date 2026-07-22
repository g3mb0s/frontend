import type { ContentStatus, ExerciseInput, ExerciseType } from "@/lib/content/types";
import { Card } from "@/components/ui/card";
import { Checkbox, Field, Input, Select } from "@/components/ui/form-controls";
import { exerciseTypes } from "./model";

export function ExerciseGeneralForm({ exercise, tags, onChange, onTagsChange, onTypeChange }: { exercise: ExerciseInput; tags: string; onChange: (patch: Partial<ExerciseInput>) => void; onTagsChange: (value: string) => void; onTypeChange: (type: ExerciseType) => void }) {
  return (
    <Card><div className="grid gap-5 md:grid-cols-2">
      <Field label="Название"><Input value={exercise.title} onChange={(event) => onChange({ title: event.target.value })} placeholder="Например, Present Simple: пропуски" /></Field>
      <Field label="Тип"><Select value={exercise.type} onChange={(event) => onTypeChange(event.target.value as ExerciseType)}>{exerciseTypes.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}</Select></Field>
      <Field label="Уровень"><Input value={exercise.level} onChange={(event) => onChange({ level: event.target.value })} placeholder="A1" /></Field>
      <Field label="Язык"><Input value={exercise.language} onChange={(event) => onChange({ language: event.target.value })} placeholder="en" /></Field>
      <Field label="Статус"><Select value={exercise.metadata.status} onChange={(event) => onChange({ metadata: { ...exercise.metadata, status: event.target.value as ContentStatus } })}><option value="draft">Черновик</option><option value="published">Опубликован</option><option value="archived">Архив</option></Select></Field>
      <Field label="Теги через запятую"><Input value={tags} onChange={(event) => onTagsChange(event.target.value)} placeholder="grammar, present-simple" /></Field>
    </div></Card>
  );
}

export function ExerciseBehaviorForm({ exercise, onChange }: { exercise: ExerciseInput; onChange: (patch: Partial<ExerciseInput>) => void }) {
  const changeSetting = (patch: Record<string, unknown>) => onChange({ settings: { ...exercise.settings, ...patch } });
  const changeScoring = (patch: Record<string, unknown>) => onChange({ scoring: { ...exercise.scoring, ...patch } });

  return (
    <Card><h2 className="text-lg font-semibold">Поведение и оценивание</h2><div className="mt-5 grid gap-5 md:grid-cols-2">
      <div className="space-y-3"><Checkbox label="Перемешивать задания" checked={Boolean(exercise.settings.shuffleItems)} onChange={(value) => changeSetting({ shuffleItems: value })} /><Checkbox label="Перемешивать варианты" checked={Boolean(exercise.settings.shuffleOptions)} onChange={(value) => changeSetting({ shuffleOptions: value })} /><Checkbox label="Учитывать регистр" checked={Boolean(exercise.settings.caseSensitive)} onChange={(value) => changeSetting({ caseSensitive: value })} /></div>
      <div className="grid gap-3 sm:grid-cols-2"><Field label="Режим"><Input value={String(exercise.scoring.mode ?? "per_item")} onChange={(event) => changeScoring({ mode: event.target.value })} /></Field><Field label="Максимум баллов"><Input type="number" min="0" value={Number(exercise.scoring.maxScore ?? 1)} onChange={(event) => changeScoring({ maxScore: Number(event.target.value) })} /></Field></div>
    </div></Card>
  );
}
