"use client";

import { EditorActions } from "@/components/ui/editor-actions";
import { ExerciseContentForm } from "./content-form";
import { ExercisePreview } from "./exercise-preview";
import { ExerciseBehaviorForm, ExerciseGeneralForm } from "./exercise-settings-form";
import { useExerciseEditor } from "./use-exercise-editor";

export function ExerciseEditor({ exerciseId }: { exerciseId?: string }) {
  const editor = useExerciseEditor(exerciseId);

  if (editor.loading) return <p className="py-10 text-sm text-slate-500">Загружаем упражнение…</p>;

  return (
    <div className="space-y-6">
      <ExerciseGeneralForm exercise={editor.exercise} tags={editor.tags} onChange={editor.updateExercise} onTagsChange={editor.setTags} onTypeChange={editor.changeType} />
      <ExerciseContentForm type={editor.exercise.type} content={editor.exercise.content} onChange={(content) => editor.updateExercise({ content })} />
      <ExerciseBehaviorForm exercise={editor.exercise} onChange={editor.updateExercise} />
      <EditorActions message={editor.message} saving={editor.saving} savingLabel="Проверяем…" onPreview={() => editor.setPreview(true)} onSave={() => void editor.save()} />
      {editor.preview && <ExercisePreview exercise={editor.exercise} exerciseId={exerciseId} onClose={() => editor.setPreview(false)} />}
    </div>
  );
}
