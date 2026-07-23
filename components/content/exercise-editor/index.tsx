"use client";

import { EditorActions } from "@/components/ui/editor-actions";
import { AiGeneratorBanner } from "./ai-generator-banner";
import { AiGeneratorModal } from "./ai-generator-modal";
import { ExerciseContentForm } from "./content-form";
import { ExercisePreview } from "./exercise-preview";
import { ExerciseBehaviorForm, ExerciseGeneralForm } from "./exercise-settings-form";
import { useExerciseEditor } from "./use-exercise-editor";

export function ExerciseEditor({ exerciseId }: { exerciseId?: string }) {
  const editor = useExerciseEditor(exerciseId);

  if (editor.loading) return <p className="py-10 text-sm text-slate-500">Загружаем упражнение…</p>;

  return (
    <div className="space-y-6">
      {!exerciseId && <AiGeneratorBanner onOpen={editor.openAiGenerator} />}
      <ExerciseGeneralForm exercise={editor.exercise} tags={editor.tags} onChange={editor.updateExercise} onTagsChange={editor.setTags} onTypeChange={editor.changeType} />
      <ExerciseContentForm type={editor.exercise.type} content={editor.exercise.content} onChange={(content) => editor.updateExercise({ content })} />
      <ExerciseBehaviorForm exercise={editor.exercise} onChange={editor.updateExercise} />
      <EditorActions message={editor.message} saving={editor.saving} savingLabel="Проверяем…" onPreview={() => editor.setPreview(true)} onSave={() => void editor.save()} />
      {editor.preview && <ExercisePreview exercise={editor.exercise} exerciseId={exerciseId} onClose={() => editor.setPreview(false)} />}
      {editor.aiOpen && (
        <AiGeneratorModal
          exercise={editor.exercise}
          tags={editor.tags}
          generating={editor.generating}
          error={editor.generationError}
          onClose={editor.closeAiGenerator}
          onGenerate={editor.generateWithAi}
        />
      )}
    </div>
  );
}
