"use client";

import { EditorActions } from "@/components/ui/editor-actions";
import { CategoriesForm } from "./categories-form";
import { ExamplesForm } from "./examples-form";
import { useWordEditor } from "./use-word-editor";
import { WordForm } from "./word-form";

export function WordEditor({ wordId }: { wordId?: string }) {
  const editor = useWordEditor(wordId);

  if (editor.loading) return <p className="py-10 text-sm text-slate-500">Загружаем слово…</p>;

  return (
    <div className="space-y-6">
      <WordForm word={editor.word} onWordChange={editor.updateWord} />
      <CategoriesForm
        word={editor.word}
        categories={editor.categories}
        newCategorySlugs={editor.newCategorySlugs}
        onToggleCategory={editor.toggleCategory}
        onNewCategorySlugsChange={editor.setNewCategorySlugs}
      />
      <ExamplesForm word={editor.word} onExampleChange={editor.updateExample} onExampleAdd={editor.addExample} onExampleRemove={editor.removeExample} />
      <EditorActions message={editor.message} saving={editor.saving} onSave={() => void editor.save()} />
    </div>
  );
}
