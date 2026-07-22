"use client";

import { EditorActions } from "@/components/ui/editor-actions";
import { ArticleForm } from "./article-form";
import { ArticlePreview } from "./article-preview";
import { useArticleEditor } from "./use-article-editor";

export function ArticleEditor({ articleId }: { articleId?: string }) {
  const editor = useArticleEditor(articleId);

  if (editor.loading) return <p className="py-10 text-sm text-slate-500">Загружаем статью…</p>;

  return (
    <div className="space-y-6">
      <ArticleForm article={editor.article} tags={editor.tags} exercises={editor.exercises} onArticleChange={editor.updateArticle} onTagsChange={editor.setTags} onBlockChange={editor.updateBlock} onBlockAdd={editor.addBlock} onBlockRemove={editor.removeBlock} onBlockMove={editor.moveBlock} />
      <EditorActions message={editor.message} saving={editor.saving} onPreview={() => editor.setPreview(true)} onSave={() => void editor.save()} />
      {editor.preview && <ArticlePreview article={editor.article} onClose={() => editor.setPreview(false)} />}
    </div>
  );
}
