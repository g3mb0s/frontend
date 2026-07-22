import { Button } from "@/components/ui/button";
import { Card, NestedCard } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/form-controls";
import { moveItem, replaceItem } from "@/lib/utils/collections";
import type { ExerciseItemsFormProps } from "./content-form";
import { EditorHeading, RowActions } from "./editor-section";
import { objectList, sentenceItem, uniqueId } from "./model";

export function SentenceForm({ type, items, setItems }: ExerciseItemsFormProps & { type: "sentence_from_audio" | "sentence_from_translation" }) {
  return (
    <Card>
      <EditorHeading title="Сборка предложения" help="Добавьте доступные слова и сформируйте правильный порядок кнопками." onAdd={() => setItems([...items, sentenceItem(type)])} />
      <div className="mt-5 space-y-5">{items.map((item, index) => <SentenceItem key={index} type={type} item={item} index={index} length={items.length} onChange={(next) => setItems(replaceItem(items, index, next))} onMove={(direction) => setItems(moveItem(items, index, direction))} onDelete={() => setItems(items.filter((_, currentIndex) => currentIndex !== index))} />)}</div>
    </Card>
  );
}

function SentenceItem({ type, item, index, length, onChange, onMove, onDelete }: { type: "sentence_from_audio" | "sentence_from_translation"; item: Record<string, unknown>; index: number; length: number; onChange: (item: Record<string, unknown>) => void; onMove: (direction: -1 | 1) => void; onDelete: () => void }) {
  const words = objectList(item.words);
  const answer = Array.isArray(item.answer) ? item.answer as string[] : [];
  const update = (patch: Record<string, unknown>) => onChange({ ...item, ...patch });

  return (
    <NestedCard>
      <RowActions index={index} length={length} onMove={onMove} onDelete={onDelete} />
      {type === "sentence_from_audio" ? <Field label="URL аудио"><Input value={String((item.audio as Record<string, unknown> | undefined)?.url ?? "")} onChange={(event) => update({ audio: { url: event.target.value } })} placeholder="https://example.com/audio.mp3" /></Field> : <Field label="Перевод"><Input value={String((item.translation as Record<string, unknown> | undefined)?.ru ?? "")} onChange={(event) => update({ translation: { ru: event.target.value } })} placeholder="Например, Я люблю английский" /></Field>}
      <h3 className="mt-4 text-sm font-semibold">Доступные слова</h3>
      <div className="mt-2 flex flex-wrap gap-2">{words.map((word, wordIndex) => <div key={String(word.id)} className="flex rounded-lg border bg-white"><Input value={String(word.text ?? "")} onChange={(event) => update({ words: replaceItem(words, wordIndex, { ...word, text: event.target.value }) })} className="w-28 rounded-r-none border-0" placeholder="Слово" /><Button variant="danger" className="rounded-l-none" onClick={() => update({ words: words.filter((_, currentIndex) => currentIndex !== wordIndex), answer: answer.filter((id) => id !== word.id) })}>×</Button></div>)}</div>
      <Button className="mt-2" onClick={() => update({ words: [...words, { id: uniqueId("word"), text: "" }] })}>Добавить слово</Button>
      <h3 className="mt-5 text-sm font-semibold">Правильный порядок</h3>
      <div className="mt-2 flex min-h-12 flex-wrap gap-2 rounded-xl border border-dashed border-slate-300 bg-white p-2">{answer.map((id, answerIndex) => { const word = words.find((entry) => entry.id === id); return <Button variant="ghost" key={`${id}-${answerIndex}`} onClick={() => update({ answer: answer.filter((_, currentIndex) => currentIndex !== answerIndex) })}>{String(word?.text ?? id)} ×</Button>; })}</div>
      <div className="mt-2 flex flex-wrap gap-2">{words.map((word) => <Button key={String(word.id)} onClick={() => update({ answer: [...answer, String(word.id)] })}>+ {String(word.text || "слово")}</Button>)}</div>
    </NestedCard>
  );
}
