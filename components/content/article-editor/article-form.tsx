import type { ArticleBlock, ArticleInput, ContentStatus, Exercise } from "@/lib/content/types";
import { Button } from "@/components/ui/button";
import { Card, EmptyState } from "@/components/ui/card";
import { Field, Input, Select, Textarea } from "@/components/ui/form-controls";
import { OrderControls } from "@/components/ui/order-controls";

type ArticleFormProps = {
  article: ArticleInput;
  tags: string;
  exercises: Exercise[];
  onArticleChange: (patch: Partial<ArticleInput>) => void;
  onTagsChange: (value: string) => void;
  onBlockChange: (index: number, block: ArticleBlock) => void;
  onBlockAdd: () => void;
  onBlockRemove: (index: number) => void;
  onBlockMove: (index: number, direction: -1 | 1) => void;
};

export function ArticleForm({ article, tags, exercises, onArticleChange, onTagsChange, onBlockChange, onBlockAdd, onBlockRemove, onBlockMove }: ArticleFormProps) {
  return (
    <>
      <Card>
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Название"><Input value={article.title} onChange={(event) => onArticleChange({ title: event.target.value })} placeholder="Например, Когда использовать Present Simple" /></Field>
          <Field label="Статус"><Select value={article.status} onChange={(event) => onArticleChange({ status: event.target.value as ContentStatus })}><option value="draft">Черновик</option><option value="published">Опубликован</option><option value="archived">Архив</option></Select></Field>
        </div>
        <Field label="Теги через запятую" className="mt-5"><Input value={tags} onChange={(event) => onTagsChange(event.target.value)} placeholder="grammar, present-simple" /></Field>
      </Card>

      <div className="flex items-center justify-between gap-4">
        <div><h2 className="text-xl font-semibold">Блоки статьи</h2><p className="mt-1 text-sm text-slate-500">Текст, медиа, заметки и ссылки на упражнения.</p></div>
        <Button onClick={onBlockAdd}>Добавить блок</Button>
      </div>

      {article.blocks.map((block, index) => <ArticleBlockForm key={index} block={block} index={index} length={article.blocks.length} exercises={exercises} onChange={(next) => onBlockChange(index, next)} onMove={(direction) => onBlockMove(index, direction)} onRemove={() => onBlockRemove(index)} />)}
      {article.blocks.length === 0 && <EmptyState>Добавьте первый блок статьи.</EmptyState>}
    </>
  );
}

function ArticleBlockForm({ block, index, length, exercises, onChange, onMove, onRemove }: { block: ArticleBlock; index: number; length: number; exercises: Exercise[]; onChange: (block: ArticleBlock) => void; onMove: (direction: -1 | 1) => void; onRemove: () => void }) {
  return (
    <Card className="p-5">
      <div className="grid gap-3 md:grid-cols-[auto_180px_1fr_auto]">
        <OrderControls index={index} length={length} onMove={onMove} />
        <Select value={block.type} onChange={(event) => onChange({ type: event.target.value as ArticleBlock["type"] })}><option value="text">Текст</option><option value="callout">Заметка</option><option value="image">Изображение</option><option value="audio">Аудио</option><option value="video">Видео</option><option value="exercise_link">Упражнение</option></Select>
        <Input value={block.title ?? ""} onChange={(event) => onChange({ ...block, title: event.target.value })} placeholder="Заголовок блока (необязательно)" />
        <Button variant="danger" onClick={onRemove}>Удалить</Button>
      </div>
      <div className="mt-3">
        {(block.type === "text" || block.type === "callout") && <Textarea value={block.text ?? ""} onChange={(event) => onChange({ ...block, text: event.target.value })} className="min-h-32" placeholder="Текст блока" />}
        {(block.type === "image" || block.type === "audio" || block.type === "video") && <Input value={block.url ?? ""} onChange={(event) => onChange({ ...block, url: event.target.value })} placeholder="https://…" />}
        {block.type === "exercise_link" && <Select value={block.exerciseId ?? ""} onChange={(event) => onChange({ ...block, exerciseId: event.target.value })}><option value="">Выберите упражнение</option>{exercises.map((exercise) => <option key={exercise.id} value={exercise.id}>{exercise.title || "Без названия"} · {exercise.status}</option>)}</Select>}
      </div>
    </Card>
  );
}
