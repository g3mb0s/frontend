"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MaterialRenderer } from "./material-renderer";
import { createExercise, getManagedExercise, updateExercise } from "@/lib/content/api";
import type { ContentStatus, ExerciseInput, ExerciseType } from "@/lib/content/types";

export function ExerciseEditor({ exerciseId }: { exerciseId?: string }) {
  const router = useRouter();
  const [exercise, setExercise] = useState<ExerciseInput>(() => newExercise("fill_gap_choice"));
  const [tags, setTags] = useState("");
  const [loading, setLoading] = useState(Boolean(exerciseId));
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!exerciseId) return;
    void getManagedExercise(exerciseId).then((value) => {
      setExercise({ type: value.type, title: value.title ?? "", level: value.level ?? "", language: value.language ?? "", tags: value.tags, content: value.payload.content, settings: value.payload.settings ?? {}, scoring: value.payload.scoring, metadata: value.payload.metadata });
      setTags(value.tags.join(", "));
      setLoading(false);
    }).catch((error: Error) => { setMessage(error.message); setLoading(false); });
  }, [exerciseId]);

  function changeType(type: ExerciseType) {
    const template = newExercise(type);
    setExercise({ ...exercise, type, content: template.content });
  }

  async function save() {
    setSaving(true);
    setMessage(null);
    try {
      const input = { ...exercise, tags: tags.split(",").map((tag) => tag.trim()).filter(Boolean) };
      const saved = exerciseId ? await updateExercise(exerciseId, input) : await createExercise(input);
      if (!exerciseId) router.replace(`/admin/exercises/${saved.id}`);
      else setMessage("Изменения сохранены");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Не удалось сохранить упражнение");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="py-10 text-sm text-slate-500">Загружаем упражнение…</p>;

  return <div className="space-y-6">
    <section className={cardClass}><div className="grid gap-5 md:grid-cols-2">
      <Field label="Название"><input value={exercise.title} onChange={(event) => setExercise({ ...exercise, title: event.target.value })} className={inputClass} placeholder="Например, Present Simple: пропуски" /></Field>
      <Field label="Тип"><select value={exercise.type} onChange={(event) => changeType(event.target.value as ExerciseType)} className={inputClass}>{exerciseTypes.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}</select></Field>
      <Field label="Уровень"><input value={exercise.level} onChange={(event) => setExercise({ ...exercise, level: event.target.value })} className={inputClass} placeholder="A1" /></Field>
      <Field label="Язык"><input value={exercise.language} onChange={(event) => setExercise({ ...exercise, language: event.target.value })} className={inputClass} placeholder="en" /></Field>
      <Field label="Статус"><select value={exercise.metadata.status} onChange={(event) => setExercise({ ...exercise, metadata: { ...exercise.metadata, status: event.target.value as ContentStatus } })} className={inputClass}><option value="draft">Черновик</option><option value="published">Опубликован</option><option value="archived">Архив</option></select></Field>
      <Field label="Теги через запятую"><input value={tags} onChange={(event) => setTags(event.target.value)} className={inputClass} placeholder="grammar, present-simple" /></Field>
    </div></section>

    <ContentForm type={exercise.type} content={exercise.content} onChange={(content) => setExercise({ ...exercise, content })} />

    <section className={cardClass}><h2 className="text-lg font-semibold">Поведение и оценивание</h2><div className="mt-5 grid gap-5 md:grid-cols-2">
      <div className="space-y-3"><Check label="Перемешивать задания" checked={Boolean(exercise.settings.shuffleItems)} onChange={(value) => setExercise({ ...exercise, settings: { ...exercise.settings, shuffleItems: value } })} /><Check label="Перемешивать варианты" checked={Boolean(exercise.settings.shuffleOptions)} onChange={(value) => setExercise({ ...exercise, settings: { ...exercise.settings, shuffleOptions: value } })} /><Check label="Учитывать регистр" checked={Boolean(exercise.settings.caseSensitive)} onChange={(value) => setExercise({ ...exercise, settings: { ...exercise.settings, caseSensitive: value } })} /></div>
      <div className="grid gap-3 sm:grid-cols-2"><Field label="Режим"><input value={String(exercise.scoring.mode ?? "per_item")} onChange={(event) => setExercise({ ...exercise, scoring: { ...exercise.scoring, mode: event.target.value } })} className={inputClass} /></Field><Field label="Максимум баллов"><input type="number" min="0" value={Number(exercise.scoring.maxScore ?? 1)} onChange={(event) => setExercise({ ...exercise, scoring: { ...exercise.scoring, maxScore: Number(event.target.value) } })} className={inputClass} /></Field></div>
    </div></section>

    <div className="sticky bottom-4 flex items-center justify-between rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-lg backdrop-blur"><p className={message === "Изменения сохранены" ? "text-sm text-emerald-700" : "text-sm text-red-600"}>{message}</p><div className="flex gap-2"><button type="button" onClick={() => setPreview(true)} className={secondaryButton}>Предпросмотр</button><button type="button" disabled={saving} onClick={() => void save()} className={primaryButton}>{saving ? "Проверяем…" : "Сохранить"}</button></div></div>
    {preview && <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-sm"><div className="mx-auto my-8 max-w-3xl rounded-3xl bg-white p-8 shadow-2xl"><div className="mb-6 flex justify-between"><h2 className="text-2xl font-bold">{exercise.title || "Предпросмотр упражнения"}</h2><button type="button" onClick={() => setPreview(false)} className="text-sm font-medium">Закрыть</button></div><MaterialRenderer type="exercise" content={{ id: exerciseId ?? "preview", title: exercise.title, status: exercise.metadata.status, level: exercise.level, payload: { ...exercise, id: exerciseId ?? "00000000-0000-4000-8000-000000000000" } }} /></div></div>}
  </div>;
}

function ContentForm({ type, content, onChange }: { type: ExerciseType; content: Record<string, unknown>; onChange: (content: Record<string, unknown>) => void }) {
  const items = Array.isArray(content.items) ? content.items as Record<string, unknown>[] : [];
  const setItems = (next: Record<string, unknown>[]) => onChange({ ...content, items: next });
  if (type === "fill_gap_choice" || type === "fill_gap_input") return <FillGapForm type={type} items={items} setItems={setItems} />;
  if (type === "matching") return <MatchingForm items={items} setItems={setItems} />;
  return <SentenceForm type={type} items={items} setItems={setItems} />;
}

function FillGapForm({ type, items, setItems }: { type: "fill_gap_choice" | "fill_gap_input"; items: Record<string, unknown>[]; setItems: (items: Record<string, unknown>[]) => void }) {
  return <section className={cardClass}><EditorHeading title="Задания с пропусками" help="Вставляйте ключ пропуска в текст в формате {{gap-1}}." onAdd={() => setItems([...items, fillGapItem(type, items.length)])} />
    <div className="mt-5 space-y-5">{items.map((item, itemIndex) => { const gaps = Array.isArray(item.gaps) ? item.gaps as Record<string, unknown>[] : []; return <div key={String(item.id ?? itemIndex)} className={nestedClass}><RowActions index={itemIndex} length={items.length} onMove={(direction) => setItems(moveItem(items, itemIndex, direction))} onDelete={() => setItems(items.filter((_, index) => index !== itemIndex))} /><Field label={`Текст задания ${itemIndex + 1}`}><textarea value={String(item.text ?? "")} onChange={(event) => setItems(replace(items, itemIndex, { ...item, text: event.target.value }))} className={`${inputClass} min-h-24`} placeholder="Например, She {{gap-1}} to school every day." /></Field>
      <div className="mt-4 space-y-3">{gaps.map((gap, gapIndex) => <div key={gapIndex} className="grid gap-3 rounded-xl bg-white p-3 md:grid-cols-3"><Field label="Ключ"><input value={String(gap.key ?? "")} onChange={(event) => setItems(replace(items, itemIndex, { ...item, gaps: replace(gaps, gapIndex, { ...gap, key: event.target.value }) }))} className={inputClass} placeholder="gap-1" /></Field>{type === "fill_gap_choice" && <Field label="Варианты через запятую"><input value={stringList(gap.options)} onChange={(event) => setItems(replace(items, itemIndex, { ...item, gaps: replace(gaps, gapIndex, { ...gap, options: splitList(event.target.value) }) }))} className={inputClass} placeholder="go, goes" /></Field>}<Field label="Правильные ответы"><input value={stringList(gap.answers)} onChange={(event) => setItems(replace(items, itemIndex, { ...item, gaps: replace(gaps, gapIndex, { ...gap, answers: splitList(event.target.value) }) }))} className={inputClass} placeholder="goes" /></Field><button type="button" onClick={() => setItems(replace(items, itemIndex, { ...item, gaps: gaps.filter((_, index) => index !== gapIndex) }))} className="self-end px-2 py-2 text-sm text-red-600">Удалить пропуск</button></div>)}</div>
      <button type="button" onClick={() => setItems(replace(items, itemIndex, { ...item, gaps: [...gaps, type === "fill_gap_choice" ? { key: "", options: [], answers: [] } : { key: "", answers: [], acceptedAnswers: [] }] }))} className={`${secondaryButton} mt-3`}>Добавить пропуск</button></div>; })}</div>
  </section>;
}

function MatchingForm({ items, setItems }: { items: Record<string, unknown>[]; setItems: (items: Record<string, unknown>[]) => void }) {
  return <section className={cardClass}><EditorHeading title="Сопоставление" help="Создайте элементы слева и справа, затем укажите правильные пары." onAdd={() => setItems([...items, matchingItem(items.length)])} /><div className="mt-5 space-y-5">{items.map((item, itemIndex) => { const left = objectList(item.left); const right = objectList(item.right); const pairs = Array.isArray(item.pairs) ? item.pairs as string[][] : []; const update = (patch: Record<string, unknown>) => setItems(replace(items, itemIndex, { ...item, ...patch })); return <div key={itemIndex} className={nestedClass}><RowActions index={itemIndex} length={items.length} onMove={(direction) => setItems(moveItem(items, itemIndex, direction))} onDelete={() => setItems(items.filter((_, index) => index !== itemIndex))} /><div className="grid gap-5 md:grid-cols-2"><MatchColumn title="Левая колонка" values={left} onChange={(values) => update({ left: values })} /><MatchColumn title="Правая колонка" values={right} onChange={(values) => update({ right: values })} /></div><h4 className="mt-5 text-sm font-semibold">Правильные пары</h4><div className="mt-2 space-y-2">{pairs.map((pair, pairIndex) => <div key={pairIndex} className="grid gap-2 md:grid-cols-[1fr_1fr_auto]"><select value={pair[0]} onChange={(event) => update({ pairs: replace(pairs, pairIndex, [event.target.value, pair[1]]) })} className={inputClass}>{left.map((entry) => <option key={String(entry.id)} value={String(entry.id)}>{String(entry.text)}</option>)}</select><select value={pair[1]} onChange={(event) => update({ pairs: replace(pairs, pairIndex, [pair[0], event.target.value]) })} className={inputClass}>{right.map((entry) => <option key={String(entry.id)} value={String(entry.id)}>{String(entry.text)}</option>)}</select><button type="button" onClick={() => update({ pairs: pairs.filter((_, index) => index !== pairIndex) })} className="text-red-600">×</button></div>)}</div><button type="button" disabled={!left.length || !right.length} onClick={() => update({ pairs: [...pairs, [String(left[0].id), String(right[0].id)]] })} className={`${secondaryButton} mt-3`}>Добавить пару</button></div>; })}</div></section>;
}

function MatchColumn({ title, values, onChange }: { title: string; values: Record<string, unknown>[]; onChange: (values: Record<string, unknown>[]) => void }) { return <div><h4 className="text-sm font-semibold">{title}</h4><div className="mt-2 space-y-2">{values.map((entry, index) => <div key={String(entry.id)} className="flex gap-2"><input value={String(entry.text ?? "")} onChange={(event) => onChange(replace(values, index, { ...entry, text: event.target.value }))} className={inputClass} placeholder={title === "Левая колонка" ? "Например, go" : "Например, идти"} /><button type="button" onClick={() => onChange(values.filter((_, itemIndex) => itemIndex !== index))} className="text-red-600">×</button></div>)}</div><button type="button" onClick={() => onChange([...values, { id: uniqueId("match"), text: "" }])} className={`${secondaryButton} mt-2`}>Добавить</button></div>; }

function SentenceForm({ type, items, setItems }: { type: "sentence_from_audio" | "sentence_from_translation"; items: Record<string, unknown>[]; setItems: (items: Record<string, unknown>[]) => void }) {
  return <section className={cardClass}><EditorHeading title="Сборка предложения" help="Добавьте доступные слова и сформируйте правильный порядок кнопками." onAdd={() => setItems([...items, sentenceItem(type)])} /><div className="mt-5 space-y-5">{items.map((item, itemIndex) => {
    const words = objectList(item.words); const answer = Array.isArray(item.answer) ? item.answer as string[] : [];
    const update = (patch: Record<string, unknown>) => setItems(replace(items, itemIndex, { ...item, ...patch }));
    return <div key={itemIndex} className={nestedClass}><RowActions index={itemIndex} length={items.length} onMove={(direction) => setItems(moveItem(items, itemIndex, direction))} onDelete={() => setItems(items.filter((_, index) => index !== itemIndex))} />
      {type === "sentence_from_audio" ? <Field label="URL аудио"><input value={String((item.audio as Record<string, unknown> | undefined)?.url ?? "")} onChange={(event) => update({ audio: { url: event.target.value } })} className={inputClass} placeholder="https://example.com/audio.mp3" /></Field> : <Field label="Перевод"><input value={String((item.translation as Record<string, unknown> | undefined)?.ru ?? "")} onChange={(event) => update({ translation: { ru: event.target.value } })} className={inputClass} placeholder="Например, Я люблю английский" /></Field>}
      <h4 className="mt-4 text-sm font-semibold">Доступные слова</h4><div className="mt-2 flex flex-wrap gap-2">{words.map((word, wordIndex) => <div key={String(word.id)} className="flex rounded-lg border bg-white"><input value={String(word.text ?? "")} onChange={(event) => update({ words: replace(words, wordIndex, { ...word, text: event.target.value }) })} className="w-28 rounded-l-lg px-3 py-2 text-sm outline-none" placeholder="Слово" /><button type="button" onClick={() => update({ words: words.filter((_, index) => index !== wordIndex), answer: answer.filter((id) => id !== word.id) })} className="px-2 text-red-600">×</button></div>)}</div>
      <button type="button" onClick={() => update({ words: [...words, { id: uniqueId("word"), text: "" }] })} className={`${secondaryButton} mt-2`}>Добавить слово</button><h4 className="mt-5 text-sm font-semibold">Правильный порядок</h4><div className="mt-2 flex min-h-12 flex-wrap gap-2 rounded-xl border border-dashed border-slate-300 bg-white p-2">{answer.map((id, index) => { const word = words.find((entry) => entry.id === id); return <button type="button" key={`${id}-${index}`} onClick={() => update({ answer: answer.filter((_, answerIndex) => answerIndex !== index) })} className="rounded-lg bg-indigo-50 px-3 py-2 text-sm text-indigo-700">{String(word?.text ?? id)} ×</button>; })}</div><div className="mt-2 flex flex-wrap gap-2">{words.map((word) => <button type="button" key={String(word.id)} onClick={() => update({ answer: [...answer, String(word.id)] })} className={secondaryButton}>+ {String(word.text || "слово")}</button>)}</div>
    </div>;
  })}</div></section>;
}

function EditorHeading({ title, help, onAdd }: { title: string; help: string; onAdd: () => void }) { return <div className="flex items-start justify-between gap-4"><div><h2 className="text-lg font-semibold">{title}</h2><p className="mt-1 text-sm text-slate-500">{help}</p></div><button type="button" onClick={onAdd} className={secondaryButton}>Добавить задание</button></div>; }
function RowActions({ index, length, onMove, onDelete }: { index: number; length: number; onMove: (direction: -1 | 1) => void; onDelete: () => void }) { return <div className="mb-3 flex justify-end gap-1"><button type="button" disabled={index === 0} onClick={() => onMove(-1)} className={smallButton}>↑</button><button type="button" disabled={index === length - 1} onClick={() => onMove(1)} className={smallButton}>↓</button><button type="button" onClick={onDelete} className="rounded px-2 py-1 text-xs text-red-600 hover:bg-red-50">Удалить</button></div>; }
function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) { return <label className="flex items-center gap-3 text-sm"><input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="h-4 w-4 accent-indigo-600" />{label}</label>; }
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block text-sm font-medium text-slate-700"><span className="mb-2 block">{label}</span>{children}</label>; }

function newExercise(type: ExerciseType): ExerciseInput { return { type, title: "", level: "", language: "", tags: [], content: { items: [] }, settings: { shuffleItems: false, shuffleOptions: false, caseSensitive: false }, scoring: { mode: "per_item", maxScore: 1 }, metadata: { version: 1, status: "draft" } }; }
function fillGapItem(type: "fill_gap_choice" | "fill_gap_input", index: number) { const gap = type === "fill_gap_choice" ? { key: "", options: [], answers: [] } : { key: "", answers: [], acceptedAnswers: [] }; return { id: uniqueId(`item-${index + 1}`), text: "", gaps: [gap] }; }
function matchingItem(index: number) { return { id: uniqueId(`matching-${index}`), left: [], right: [], pairs: [] }; }
function sentenceItem(type: "sentence_from_audio" | "sentence_from_translation") { return { ...(type === "sentence_from_audio" ? { audio: { url: "" } } : { translation: { ru: "" } }), words: [], answer: [] }; }
function uniqueId(prefix: string) { return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`; }
function replace<T>(items: T[], index: number, value: T) { return items.map((item, itemIndex) => itemIndex === index ? value : item); }
function moveItem<T>(items: T[], index: number, direction: -1 | 1) { const target = index + direction; if (target < 0 || target >= items.length) return items; const next = [...items]; [next[index], next[target]] = [next[target], next[index]]; return next; }
function objectList(value: unknown) { return Array.isArray(value) ? value as Record<string, unknown>[] : []; }
function stringList(value: unknown) { return Array.isArray(value) ? value.join(", ") : ""; }
function splitList(value: string) { return value.split(",").map((item) => item.trim()).filter(Boolean); }

const inputClass = "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100";
const cardClass = "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm";
const nestedClass = "rounded-xl border border-slate-200 bg-slate-50 p-4";
const secondaryButton = "rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium hover:bg-slate-50 disabled:opacity-40";
const primaryButton = "rounded-lg bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50";
const smallButton = "rounded px-2 py-1 text-xs text-slate-600 hover:bg-slate-200 disabled:opacity-20";
const exerciseTypes: { value: ExerciseType; label: string }[] = [{ value: "fill_gap_choice", label: "Выбор пропуска" }, { value: "fill_gap_input", label: "Ввод пропуска" }, { value: "matching", label: "Сопоставление" }, { value: "sentence_from_audio", label: "Предложение по аудио" }, { value: "sentence_from_translation", label: "Предложение по переводу" }];
