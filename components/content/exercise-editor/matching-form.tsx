import { Button } from "@/components/ui/button";
import { Card, NestedCard } from "@/components/ui/card";
import { Input, Select } from "@/components/ui/form-controls";
import { moveItem, replaceItem } from "@/lib/utils/collections";
import type { ExerciseItemsFormProps } from "./content-form";
import { EditorHeading, RowActions } from "./editor-section";
import { matchingItem, objectList, uniqueId } from "./model";

export function MatchingForm({ items, setItems }: ExerciseItemsFormProps) {
  return (
    <Card>
      <EditorHeading title="Сопоставление" help="Создайте элементы слева и справа, затем укажите правильные пары." onAdd={() => setItems([...items, matchingItem(items.length)])} />
      <div className="mt-5 space-y-5">{items.map((item, index) => <MatchingItem key={String(item.id ?? index)} item={item} index={index} length={items.length} onChange={(next) => setItems(replaceItem(items, index, next))} onMove={(direction) => setItems(moveItem(items, index, direction))} onDelete={() => setItems(items.filter((_, currentIndex) => currentIndex !== index))} />)}</div>
    </Card>
  );
}

function MatchingItem({ item, index, length, onChange, onMove, onDelete }: { item: Record<string, unknown>; index: number; length: number; onChange: (item: Record<string, unknown>) => void; onMove: (direction: -1 | 1) => void; onDelete: () => void }) {
  const left = objectList(item.left);
  const right = objectList(item.right);
  const pairs = Array.isArray(item.pairs) ? item.pairs as string[][] : [];
  const update = (patch: Record<string, unknown>) => onChange({ ...item, ...patch });

  return (
    <NestedCard>
      <RowActions index={index} length={length} onMove={onMove} onDelete={onDelete} />
      <div className="grid gap-5 md:grid-cols-2"><MatchColumn title="Левая колонка" values={left} onChange={(values) => update({ left: values })} /><MatchColumn title="Правая колонка" values={right} onChange={(values) => update({ right: values })} /></div>
      <h3 className="mt-5 text-sm font-semibold">Правильные пары</h3>
      <div className="mt-2 space-y-2">{pairs.map((pair, pairIndex) => <div key={pairIndex} className="grid gap-2 md:grid-cols-[1fr_1fr_auto]"><Select value={pair[0]} onChange={(event) => update({ pairs: replaceItem(pairs, pairIndex, [event.target.value, pair[1]]) })}>{left.map((entry) => <option key={String(entry.id)} value={String(entry.id)}>{String(entry.text)}</option>)}</Select><Select value={pair[1]} onChange={(event) => update({ pairs: replaceItem(pairs, pairIndex, [pair[0], event.target.value]) })}>{right.map((entry) => <option key={String(entry.id)} value={String(entry.id)}>{String(entry.text)}</option>)}</Select><Button variant="danger" onClick={() => update({ pairs: pairs.filter((_, currentIndex) => currentIndex !== pairIndex) })}>×</Button></div>)}</div>
      <Button className="mt-3" disabled={!left.length || !right.length} onClick={() => update({ pairs: [...pairs, [String(left[0].id), String(right[0].id)]] })}>Добавить пару</Button>
    </NestedCard>
  );
}

function MatchColumn({ title, values, onChange }: { title: string; values: Record<string, unknown>[]; onChange: (values: Record<string, unknown>[]) => void }) {
  return <div><h3 className="text-sm font-semibold">{title}</h3><div className="mt-2 space-y-2">{values.map((entry, index) => <div key={String(entry.id)} className="flex gap-2"><Input value={String(entry.text ?? "")} onChange={(event) => onChange(replaceItem(values, index, { ...entry, text: event.target.value }))} placeholder={title === "Левая колонка" ? "Например, go" : "Например, идти"} /><Button variant="danger" onClick={() => onChange(values.filter((_, currentIndex) => currentIndex !== index))}>×</Button></div>)}</div><Button className="mt-2" onClick={() => onChange([...values, { id: uniqueId("match"), text: "" }])}>Добавить</Button></div>;
}
