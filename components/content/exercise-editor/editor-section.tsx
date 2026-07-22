import { Button } from "@/components/ui/button";
import { OrderControls } from "@/components/ui/order-controls";

export function EditorHeading({ title, help, onAdd }: { title: string; help: string; onAdd: () => void }) {
  return <div className="flex items-start justify-between gap-4"><div><h2 className="text-lg font-semibold">{title}</h2><p className="mt-1 text-sm text-slate-500">{help}</p></div><Button onClick={onAdd}>Добавить задание</Button></div>;
}

export function RowActions({ index, length, onMove, onDelete }: { index: number; length: number; onMove: (direction: -1 | 1) => void; onDelete: () => void }) {
  return <div className="mb-3 flex justify-end gap-1"><OrderControls index={index} length={length} onMove={onMove} /><Button size="sm" variant="danger" onClick={onDelete}>Удалить</Button></div>;
}
