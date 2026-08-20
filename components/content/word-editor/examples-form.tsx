import type { WordInput } from "@/lib/content/types";
import { Button } from "@/components/ui/button";
import { Card, EmptyState } from "@/components/ui/card";
import { Input } from "@/components/ui/form-controls";

interface ExamplesFormProps {
  word: WordInput;
  onExampleChange: (index: number, example: WordInput["examples"][number]) => void;
  onExampleAdd: () => void;
  onExampleRemove: (index: number) => void;
}

export function ExamplesForm({ word, onExampleChange, onExampleAdd, onExampleRemove }: ExamplesFormProps) {
  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <div><h2 className="text-xl font-semibold">Примеры</h2><p className="mt-1 text-sm text-slate-500">Выделяйте целевое слово символами #…#.</p></div>
        <Button onClick={onExampleAdd}>Добавить пример</Button>
      </div>

      {word.examples.map((example, index) => (
        <Card key={index} className="p-5">
          <div className="grid gap-3">
            <Input value={example.en ?? ""} onChange={(event) => onExampleChange(index, { ...example, en: event.target.value })} placeholder="She goes to school every day." />
            <Input value={example.ru ?? ""} onChange={(event) => onExampleChange(index, { ...example, ru: event.target.value })} placeholder="Она ходит в школу каждый день." />
          </div>
          <div className="mt-3 flex justify-end">
            <Button variant="danger" onClick={() => onExampleRemove(index)}>Удалить</Button>
          </div>
        </Card>
      ))}
      {word.examples.length === 0 && <EmptyState>Добавьте первый пример использования.</EmptyState>}
    </>
  );
}
