"use client";

/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import type { ArticleBlock, CourseEntryContent, ExerciseType } from "@/lib/content/types";
import { attemptExercise, completeArticleEntry, type ExerciseAttemptItem } from "@/lib/progress/api";

export function MaterialRenderer({ type, content, entryId, completed = false, onProgress }: { type: "article" | "exercise"; content: CourseEntryContent; entryId?: string; completed?: boolean; onProgress?: () => void }) {
  const [completing, setCompleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function completeArticle() {
    if (!entryId) return;
    setCompleting(true); setError(null);
    try { await completeArticleEntry(entryId); onProgress?.(); } catch (reason) { setError(reason instanceof Error ? reason.message : "Не удалось сохранить прогресс"); } finally { setCompleting(false); }
  }
  if (type === "article") {
    return <div className="space-y-5">{(content.blocks ?? []).map((block, index) => <ArticleBlockView key={index} block={block} />)}{error && <p className="text-sm text-red-600">{error}</p>}{entryId && <button type="button" disabled={completed || completing} onClick={() => void completeArticle()} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white disabled:bg-emerald-600">{completed ? "Статья завершена ✓" : completing ? "Сохраняем…" : "Отметить прочитанным"}</button>}</div>;
  }
  return <ExerciseView content={content} entryId={entryId} completed={completed} onProgress={onProgress} />;
}

function ArticleBlockView({ block }: { block: ArticleBlock }) {
  if (block.type === "image") {
    return <ImageBlock block={block} />;
  }
  if (block.type === "audio") {
    return <div>{block.title && <h4 className="mb-2 font-medium">{block.title}</h4>}{block.url ? <audio controls preload="metadata" src={block.url} className="w-full" /> : <MissingMedia type="аудио" />}</div>;
  }
  if (block.type === "video") {
    return <div>{block.title && <h4 className="mb-2 font-medium">{block.title}</h4>}{block.url ? <video controls preload="metadata" src={block.url} className="max-h-[520px] w-full rounded-xl bg-black" /> : <MissingMedia type="видео" />}</div>;
  }
  if (block.type === "exercise_link") {
    return <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-4 text-sm text-indigo-800">Связанное упражнение{block.title ? `: ${block.title}` : ""}</div>;
  }
  return <div className={block.type === "callout" ? "rounded-xl border border-amber-200 bg-amber-50 p-5" : ""}>{block.title && <h4 className="mb-2 text-lg font-semibold">{block.title}</h4>}{block.text && <p className="whitespace-pre-wrap leading-7 text-slate-700">{block.text}</p>}</div>;
}

function ImageBlock({ block }: { block: ArticleBlock }) {
  const [failed, setFailed] = useState(false);
  return <figure>{block.url && !failed ? <img src={block.url} alt={block.title || "Иллюстрация статьи"} className="max-h-[520px] w-full rounded-xl border border-slate-200 object-contain" loading="lazy" onError={() => setFailed(true)} /> : <MissingMedia type={failed ? `изображения: адрес ${block.url} недоступен из браузера` : "изображения"} />}{block.title && <figcaption className="mt-2 text-center text-xs text-slate-500">{block.title}</figcaption>}</figure>;
}

function ExerciseView({ content, entryId, completed, onProgress }: { content: CourseEntryContent; entryId?: string; completed: boolean; onProgress?: () => void }) {
  const [answers, setAnswers] = useState<Record<string, Record<string, string>>>({});
  const [matches, setMatches] = useState<Record<string, Record<string, string>>>({});
  const [sentences, setSentences] = useState<Record<string, string[]>>({});
  const [result, setResult] = useState<{ passed: boolean; correct: number; total: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const payload = content.payload;
  if (!payload) return <p className="text-sm text-slate-500">Содержимое упражнения недоступно.</p>;
  const items = Array.isArray(payload.content?.items) ? payload.content.items as Record<string, unknown>[] : [];
  async function check() {
    if (!entryId || !payload) return;
    setChecking(true); setError(null);
    try {
      const attemptItems: ExerciseAttemptItem[] = items.map((item, index) => {
        const itemId = String(item.id ?? `item-${index}`);
        if (payload.type === "fill_gap_choice" || payload.type === "fill_gap_input") return { itemId, gaps: answers[itemId] ?? {} };
        if (payload.type === "matching") return { itemId, pairs: Object.entries(matches[itemId] ?? {}).filter(([, rightId]) => rightId).map(([leftId, rightId]) => [leftId, rightId]) };
        return { itemId, answer: sentences[itemId] ?? [] };
      });
      const response = await attemptExercise(entryId, attemptItems); setResult(response); onProgress?.();
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Не удалось проверить ответы"); } finally { setChecking(false); }
  }
  return <div className="space-y-5"><div className="flex flex-wrap gap-2 text-xs"><span className="rounded-full bg-indigo-50 px-2.5 py-1 font-medium text-indigo-700">{exerciseLabel(payload.type)}</span>{content.level && <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">{content.level}</span>}{completed && <span className="rounded-full bg-emerald-50 px-2.5 py-1 font-medium text-emerald-700">Завершено ✓</span>}</div>{items.map((item, index) => { const itemId = String(item.id ?? `item-${index}`); return <ExerciseItem key={itemId} type={payload.type} item={item} number={index + 1} answers={answers[itemId] ?? {}} matches={matches[itemId] ?? {}} sentence={sentences[itemId] ?? []} onAnswer={(key, value) => setAnswers((current) => ({ ...current, [itemId]: { ...(current[itemId] ?? {}), [key]: value } }))} onMatch={(leftId, rightId) => setMatches((current) => ({ ...current, [itemId]: { ...(current[itemId] ?? {}), [leftId]: rightId } }))} onSentence={(answer) => setSentences((current) => ({ ...current, [itemId]: answer }))} />; })}{entryId && <button type="button" disabled={checking} onClick={() => void check()} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{checking ? "Проверяем…" : "Проверить ответы"}</button>}{result && <p className={`rounded-xl p-4 text-sm font-medium ${result.passed ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>{result.passed ? "Всё верно! Упражнение завершено." : `Правильных ответов: ${result.correct} из ${result.total}. Попробуйте ещё раз.`}</p>}{error && <p className="text-sm text-red-600">{error}</p>}</div>;
}

function ExerciseItem({ type, item, number, answers, matches, sentence, onAnswer, onMatch, onSentence }: { type: ExerciseType; item: Record<string, unknown>; number: number; answers: Record<string, string>; matches: Record<string, string>; sentence: string[]; onAnswer: (key: string, value: string) => void; onMatch: (leftId: string, rightId: string) => void; onSentence: (answer: string[]) => void }) {
  if (type === "fill_gap_choice" || type === "fill_gap_input") {
    const gaps = Array.isArray(item.gaps) ? item.gaps as Record<string, unknown>[] : [];
    return <div className="rounded-xl bg-slate-50 p-4"><p className="text-xs font-semibold text-slate-400">Задание {number}</p><p className="mt-2 font-medium">{String(item.text ?? "")}</p><div className="mt-3 space-y-2">{gaps.map((gap, index) => { const key = String(gap.key ?? ""); return <label key={index} className="flex items-center gap-3 text-sm"><span className="min-w-20 text-slate-500">{key || "Пропуск"}</span>{type === "fill_gap_choice" ? <select value={answers[key] ?? ""} onChange={(event) => onAnswer(key, event.target.value)} className="rounded-lg border border-slate-300 bg-white px-3 py-2"><option value="">Выберите ответ</option>{(Array.isArray(gap.options) ? gap.options : []).map((option) => <option key={String(option)} value={String(option)}>{String(option)}</option>)}</select> : <input value={answers[key] ?? ""} onChange={(event) => onAnswer(key, event.target.value)} className="rounded-lg border border-slate-300 bg-white px-3 py-2" placeholder="Введите ответ" />}</label>; })}</div></div>;
  }
  if (type === "matching") {
    const left = Array.isArray(item.left) ? item.left as Record<string, unknown>[] : [];
    const right = Array.isArray(item.right) ? item.right as Record<string, unknown>[] : [];
    return <div className="rounded-xl bg-slate-50 p-4"><p className="text-xs font-semibold text-slate-400">Задание {number}: сопоставьте пары</p><div className="mt-3 space-y-3">{left.map((entry) => { const leftId = String(entry.id); return <label key={leftId} className="grid gap-2 text-sm sm:grid-cols-[1fr_1fr] sm:items-center"><span className="rounded-lg border bg-white p-2">{String(entry.text)}</span><select value={matches[leftId] ?? ""} onChange={(event) => onMatch(leftId, event.target.value)} className="rounded-lg border border-slate-300 bg-white px-3 py-2"><option value="">Выберите пару</option>{right.map((choice) => <option key={String(choice.id)} value={String(choice.id)}>{String(choice.text)}</option>)}</select></label>; })}</div></div>;
  }
  const words = Array.isArray(item.words) ? item.words as Record<string, unknown>[] : [];
  const prompt = type === "sentence_from_audio" ? <audio controls src={String((item.audio as Record<string, unknown> | undefined)?.url ?? "")} /> : <p className="font-medium">{Object.values((item.translation as Record<string, unknown> | undefined) ?? {}).join(" / ")}</p>;
  const byId = new Map(words.map((word) => [String(word.id), word]));
  return <div className="rounded-xl bg-slate-50 p-4"><p className="text-xs font-semibold text-slate-400">Задание {number}: соберите предложение</p><div className="mt-3">{prompt}</div><div className="mt-4 min-h-12 rounded-lg border border-dashed border-indigo-300 bg-white p-2">{sentence.length ? <div className="flex flex-wrap gap-2">{sentence.map((wordId, index) => <button type="button" key={`${wordId}-${index}`} onClick={() => onSentence(sentence.filter((_, selectedIndex) => selectedIndex !== index))} className="rounded-lg bg-indigo-600 px-3 py-2 text-sm text-white">{String(byId.get(wordId)?.text ?? wordId)}</button>)}</div> : <span className="text-sm text-slate-400">Нажимайте на слова в нужном порядке</span>}</div><div className="mt-3 flex flex-wrap gap-2">{words.filter((word) => !sentence.includes(String(word.id))).map((word) => <button type="button" key={String(word.id)} onClick={() => onSentence([...sentence, String(word.id)])} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm hover:border-indigo-400">{String(word.text)}</button>)}</div></div>;
}

function MissingMedia({ type }: { type: string }) { return <p className="rounded-xl border border-dashed border-slate-300 p-5 text-sm text-slate-500">URL {type} не указан.</p>; }
function exerciseLabel(type: ExerciseType) { return ({ fill_gap_choice: "Выбор пропуска", fill_gap_input: "Ввод пропуска", matching: "Сопоставление", sentence_from_audio: "Предложение по аудио", sentence_from_translation: "Предложение по переводу" } as const)[type]; }
