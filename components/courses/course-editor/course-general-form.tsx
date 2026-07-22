import type { ContentStatus, CourseInput } from "@/lib/content/types";
import { Card } from "@/components/ui/card";
import { Field, Input, Select, Textarea } from "@/components/ui/form-controls";

export function CourseGeneralForm({ course, onChange }: { course: CourseInput; onChange: (patch: Partial<CourseInput>) => void }) {
  return (
    <Card>
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Название"><Input value={course.title} onChange={(event) => onChange({ title: event.target.value })} placeholder="Основы английского" /></Field>
        <Field label="Slug"><Input value={course.slug} onChange={(event) => onChange({ slug: event.target.value })} placeholder="english-basics" /></Field>
        <Field label="Уровень"><Input value={course.level} onChange={(event) => onChange({ level: event.target.value })} placeholder="A1" /></Field>
        <Field label="Статус"><Select value={course.status} onChange={(event) => onChange({ status: event.target.value as ContentStatus })}><option value="draft">Черновик</option><option value="archived">Архив</option><option value="published">Опубликован</option></Select></Field>
      </div>
      <Field label="Описание" className="mt-5"><Textarea value={course.description} onChange={(event) => onChange({ description: event.target.value })} className="min-h-28" placeholder="Кратко опишите содержание и результат курса" /></Field>
    </Card>
  );
}
