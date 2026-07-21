"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createArticle, getManagedArticle, listManagedExercises, updateArticle } from "@/lib/content/api";
import type { ArticleBlock, ArticleInput, ContentStatus, Exercise } from "@/lib/content/types";

const emptyArticle: ArticleInput = { title: "", blocks: [], exerciseIds: [], status: "draft", tags: [] };

export function ArticleEditor({ articleId }: { articleId?: string }) {
  const router = useRouter();
  const [article, setArticle] = useState<ArticleInput>(emptyArticle);
  const [tags, setTags] = useState("");
  const [loading, setLoading] = useState(Boolean(articleId));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [preview, setPreview] = useState(false);
  const [exercises, setExercises] = useState<Exercise[]>([]);

  useEffect(() => {
    void listManagedExercises().then(setExercises).catch((error: Error) => setMessage(error.message));
  }, []);

  useEffect(() => {
    if (!articleId) return;
    void getManagedArticle(articleId)
      .then((value) => {
        setArticle({ title: value.title, blocks: value.blocks, exerciseIds: value.exercise_ids, status: value.status, tags: value.tags });
        setTags(value.tags.join(", "));
        setLoading(false);
      })
      .catch((error: Error) => { setMessage(error.message); setLoading(false); });
  }, [articleId]);

  async function save() {
    setSaving(true);
    setMessage(null);
    const input = { ...article, tags: splitTags(tags), exerciseIds: article.blocks.filter((block) => block.type === "exercise_link" && block.exerciseId).map((block) => block.exerciseId!) };
    try {
      const saved = articleId ? await updateArticle(articleId, input) : await createArticle(input);
      if (!articleId) router.replace(`/admin/articles/${saved.id}`);
      else setMessage("Изменения сохранены");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Не удалось сохранить статью");
    } finally {
      setSaving(false);
    }
  }

  function updateBlock(index: number, block: ArticleBlock) {
    setArticle({ ...article, blocks: article.blocks.map((item, itemIndex) => itemIndex === index ? block : item) });
  }

  if (loading) return <p className="py-10 text-sm text-slate-500">Загружаем статью…</p>;

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Название"><input value={article.title} onChange={(event) => setArticle({ ...article, title: event.target.value })} className={inputClass} placeholder="Например, Когда использовать Present Simple" /></Field>
          <Field label="Статус"><select value={article.status} onChange={(event) => setArticle({ ...article, status: event.target.value as ContentStatus })} className={inputClass}><option value="draft">Черновик</option><option value="published">Опубликован</option><option value="archived">Архив</option></select></Field>
        </div>
        <div className="mt-5"><Field label="Теги через запятую"><input value={tags} onChange={(event) => setTags(event.target.value)} className={inputClass} placeholder="grammar, present-simple" /></Field></div>
      </section>

      <div className="flex items-center justify-between"><div><h2 className="text-xl font-semibold">Блоки статьи</h2><p className="mt-1 text-sm text-slate-500">Текст, медиа, заметки и ссылки на упражнения.</p></div><button type="button" onClick={() => setArticle({ ...article, blocks: [...article.blocks, { type: "text", text: "" }] })} className={secondaryButton}>Добавить блок</button></div>

      {article.blocks.map((block, index) => (
        <section key={index} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid gap-3 md:grid-cols-[auto_180px_1fr_auto]">
            <OrderButtons index={index} length={article.blocks.length} onMove={(direction) => setArticle({ ...article, blocks: moveItem(article.blocks, index, direction) })} />
            <select value={block.type} onChange={(event) => updateBlock(index, { type: event.target.value as ArticleBlock["type"] })} className={inputClass}><option value="text">Текст</option><option value="callout">Заметка</option><option value="image">Изображение</option><option value="audio">Аудио</option><option value="video">Видео</option><option value="exercise_link">Упражнение</option></select>
            <input value={block.title ?? ""} onChange={(event) => updateBlock(index, { ...block, title: event.target.value })} className={inputClass} placeholder="Заголовок блока (необязательно)" />
            <button type="button" onClick={() => setArticle({ ...article, blocks: article.blocks.filter((_, itemIndex) => itemIndex !== index) })} className="px-2 text-sm text-red-600">Удалить</button>
          </div>
          <div className="mt-3">
            {(block.type === "text" || block.type === "callout") && <textarea value={block.text ?? ""} onChange={(event) => updateBlock(index, { ...block, text: event.target.value })} className={`${inputClass} min-h-32`} placeholder="Текст блока" />}
            {(block.type === "image" || block.type === "audio" || block.type === "video") && <input value={block.url ?? ""} onChange={(event) => updateBlock(index, { ...block, url: event.target.value })} className={inputClass} placeholder="https://…" />}
            {block.type === "exercise_link" && <select value={block.exerciseId ?? ""} onChange={(event) => updateBlock(index, { ...block, exerciseId: event.target.value })} className={inputClass}><option value="">Выберите упражнение</option>{exercises.map((exercise) => <option key={exercise.id} value={exercise.id}>{exercise.title || "Без названия"} · {exercise.status}</option>)}</select>}
          </div>
        </section>
      ))}

      {article.blocks.length === 0 && <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">Добавьте первый блок статьи.</p>}
      <div className="sticky bottom-4 flex items-center justify-between rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-lg backdrop-blur"><p className={message === "Изменения сохранены" ? "text-sm text-emerald-700" : "text-sm text-red-600"}>{message}</p><div className="flex gap-2"><button type="button" onClick={() => setPreview(true)} className={secondaryButton}>Предпросмотр</button><button type="button" disabled={saving} onClick={() => void save()} className={primaryButton}>{saving ? "Сохраняем…" : "Сохранить"}</button></div></div>
      {preview && <ArticlePreview article={article} onClose={() => setPreview(false)} />}
    </div>
  );
}

function ArticlePreview({ article, onClose }: { article: ArticleInput; onClose: () => void }) {
  return <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-sm"><article className="mx-auto my-8 max-w-3xl rounded-3xl bg-white p-8 shadow-2xl"><div className="flex justify-between gap-4"><h1 className="text-3xl font-bold">{article.title || "Статья без названия"}</h1><button type="button" onClick={onClose} className="text-sm font-medium">Закрыть</button></div><div className="mt-8 space-y-5">{article.blocks.map((block, index) => <div key={index} className={block.type === "callout" ? "rounded-xl bg-indigo-50 p-4" : ""}>{block.title && <h2 className="mb-2 text-xl font-semibold">{block.title}</h2>}{block.text && <p className="whitespace-pre-wrap leading-7 text-slate-700">{block.text}</p>}{block.url && <p className="break-all text-sm text-indigo-700">{block.type}: {block.url}</p>}{block.exerciseId && <p className="rounded-lg bg-slate-100 p-3 text-sm">Упражнение: {block.exerciseId}</p>}</div>)}</div></article></div>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block text-sm font-medium text-slate-700"><span className="mb-2 block">{label}</span>{children}</label>; }
function splitTags(value: string) { return value.split(",").map((tag) => tag.trim()).filter(Boolean); }
function moveItem<T>(items: T[], index: number, direction: -1 | 1) { const target = index + direction; if (target < 0 || target >= items.length) return items; const next = [...items]; [next[index], next[target]] = [next[target], next[index]]; return next; }
function OrderButtons({ index, length, onMove }: { index: number; length: number; onMove: (direction: -1 | 1) => void }) { return <div className="flex gap-1"><button type="button" disabled={index === 0} onClick={() => onMove(-1)} className="px-1 disabled:opacity-20">↑</button><button type="button" disabled={index === length - 1} onClick={() => onMove(1)} className="px-1 disabled:opacity-20">↓</button></div>; }
const inputClass = "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100";
const secondaryButton = "rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium hover:bg-slate-50";
const primaryButton = "rounded-lg bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50";
