import type { ContentStatus, WordInput } from "@/lib/content/types";
import { Card } from "@/components/ui/card";
import { Field, Input, Select } from "@/components/ui/form-controls";

interface WordFormProps {
  word: WordInput;
  onWordChange: (patch: Partial<WordInput>) => void;
}

export function WordForm({ word, onWordChange }: WordFormProps) {
  return (
    <Card>
      <div className="grid gap-5 md:grid-cols-3">
        <Field label="Слово (english)"><Input value={word.word} onChange={(event) => onWordChange({ word: event.target.value })} placeholder="go" /></Field>
        <Field label="Перевод (russian)"><Input value={word.translation} onChange={(event) => onWordChange({ translation: event.target.value })} placeholder="идти" /></Field>
        <Field label="Транскрипция"><Input value={word.transcription ?? ""} onChange={(event) => onWordChange({ transcription: event.target.value })} placeholder="ɡəʊ" /></Field>
      </div>
      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <Field label="Статус"><Select value={word.status} onChange={(event) => onWordChange({ status: event.target.value as ContentStatus })}><option value="draft">Черновик</option><option value="published">Опубликован</option><option value="archived">Архив</option></Select></Field>
        <Field label="Теги через запятую"><Input value={word.tags.join(", ")} onChange={(event) => onWordChange({ tags: event.target.value.split(",").map((item) => item.trim()).filter(Boolean) })} placeholder="verbs, a1" /></Field>
      </div>
    </Card>
  );
}
