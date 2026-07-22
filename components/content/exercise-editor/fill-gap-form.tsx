import { Button } from "@/components/ui/button";
import { Card, NestedCard } from "@/components/ui/card";
import { Field, Input, Textarea } from "@/components/ui/form-controls";
import { moveItem, replaceItem, splitList } from "@/lib/utils/collections";
import type { ExerciseItemsFormProps } from "./content-form";
import { EditorHeading, RowActions } from "./editor-section";
import { fillGapItem, stringList } from "./model";

export function FillGapForm({ type, items, setItems }: ExerciseItemsFormProps & { type: "fill_gap_choice" | "fill_gap_input" }) {
  return (
    <Card>
      <EditorHeading title="Задания с пропусками" help="Вставляйте ключ пропуска в текст в формате {{gap-1}}." onAdd={() => setItems([...items, fillGapItem(type, items.length)])} />
      <div className="mt-5 space-y-5">{items.map((item, itemIndex) => <FillGapItem key={String(item.id ?? itemIndex)} type={type} item={item} index={itemIndex} length={items.length} onChange={(next) => setItems(replaceItem(items, itemIndex, next))} onMove={(direction) => setItems(moveItem(items, itemIndex, direction))} onDelete={() => setItems(items.filter((_, index) => index !== itemIndex))} />)}</div>
    </Card>
  );
}

function FillGapItem({ type, item, index, length, onChange, onMove, onDelete }: { type: "fill_gap_choice" | "fill_gap_input"; item: Record<string, unknown>; index: number; length: number; onChange: (item: Record<string, unknown>) => void; onMove: (direction: -1 | 1) => void; onDelete: () => void }) {
  const gaps = Array.isArray(item.gaps) ? item.gaps as Record<string, unknown>[] : [];
  const updateGap = (gapIndex: number, gap: Record<string, unknown>) => onChange({ ...item, gaps: replaceItem(gaps, gapIndex, gap) });

  return (
    <NestedCard>
      <RowActions index={index} length={length} onMove={onMove} onDelete={onDelete} />
      <Field label={`Текст задания ${index + 1}`}><Textarea value={String(item.text ?? "")} onChange={(event) => onChange({ ...item, text: event.target.value })} className="min-h-24" placeholder="Например, She {{gap-1}} to school every day." /></Field>
      <div className="mt-4 space-y-3">{gaps.map((gap, gapIndex) => <div key={gapIndex} className="grid gap-3 rounded-xl bg-white p-3 md:grid-cols-3"><Field label="Ключ"><Input value={String(gap.key ?? "")} onChange={(event) => updateGap(gapIndex, { ...gap, key: event.target.value })} placeholder="gap-1" /></Field>{type === "fill_gap_choice" && <Field label="Варианты через запятую"><Input value={stringList(gap.options)} onChange={(event) => updateGap(gapIndex, { ...gap, options: splitList(event.target.value) })} placeholder="go, goes" /></Field>}<Field label="Правильные ответы"><Input value={stringList(gap.answers)} onChange={(event) => updateGap(gapIndex, { ...gap, answers: splitList(event.target.value) })} placeholder="goes" /></Field><Button variant="danger" className="self-end" onClick={() => onChange({ ...item, gaps: gaps.filter((_, currentIndex) => currentIndex !== gapIndex) })}>Удалить пропуск</Button></div>)}</div>
      <Button className="mt-3" onClick={() => onChange({ ...item, gaps: [...gaps, type === "fill_gap_choice" ? { key: "", options: [], answers: [] } : { key: "", answers: [], acceptedAnswers: [] }] })}>Добавить пропуск</Button>
    </NestedCard>
  );
}
