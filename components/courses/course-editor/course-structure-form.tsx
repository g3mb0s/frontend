import type { ContentOption, CourseEntryInput, CourseSectionInput, CourseUnitInput } from "@/lib/content/types";
import { Button } from "@/components/ui/button";
import { Card, EmptyState, NestedCard } from "@/components/ui/card";
import { Field, Input, Select } from "@/components/ui/form-controls";
import { OrderControls } from "@/components/ui/order-controls";
import { statusLabel } from "./model";

type SectionActions = {
  add: () => void;
  remove: (sectionIndex: number) => void;
  move: (sectionIndex: number, direction: -1 | 1) => void;
  update: (sectionIndex: number, patch: Partial<CourseSectionInput>) => void;
};

type UnitActions = {
  add: (sectionIndex: number) => void;
  remove: (sectionIndex: number, unitIndex: number) => void;
  move: (sectionIndex: number, unitIndex: number, direction: -1 | 1) => void;
  update: (sectionIndex: number, unitIndex: number, patch: Partial<CourseUnitInput>) => void;
};

type EntryActions = {
  add: (sectionIndex: number, unitIndex: number) => void;
  remove: (sectionIndex: number, unitIndex: number, entryIndex: number) => void;
  move: (sectionIndex: number, unitIndex: number, entryIndex: number, direction: -1 | 1) => void;
  update: (sectionIndex: number, unitIndex: number, entryIndex: number, patch: Partial<CourseEntryInput>) => void;
};

type CourseStructureFormProps = {
  sections: CourseSectionInput[];
  content: ContentOption[];
  search: string;
  onSearchChange: (value: string) => void;
  sectionActions: SectionActions;
  unitActions: UnitActions;
  entryActions: EntryActions;
};

export function CourseStructureForm({ sections, content, search, onSearchChange, sectionActions, unitActions, entryActions }: CourseStructureFormProps) {
  return (
    <>
      <div className="flex items-center justify-between gap-4"><div><h2 className="text-xl font-semibold">Структура курса</h2><p className="mt-1 text-sm text-slate-500">Разделы содержат уроки, а уроки — статьи и упражнения.</p></div><Button onClick={() => sectionActions.add()}>Добавить раздел</Button></div>
      <Field label="Поиск по каталогу материалов" className="rounded-xl border border-slate-200 bg-white p-4"><Input value={search} onChange={(event) => onSearchChange(event.target.value)} placeholder="Название статьи или упражнения" /></Field>
      {sections.length === 0 && <EmptyState>Добавьте первый раздел курса.</EmptyState>}
      {sections.map((section, sectionIndex) => <CourseSectionForm key={sectionIndex} section={section} index={sectionIndex} sectionCount={sections.length} content={content} search={search} sectionActions={sectionActions} unitActions={unitActions} entryActions={entryActions} />)}
    </>
  );
}

function CourseSectionForm({ section, index, sectionCount, content, search, sectionActions, unitActions, entryActions }: { section: CourseSectionInput; index: number; sectionCount: number; content: ContentOption[]; search: string; sectionActions: SectionActions; unitActions: UnitActions; entryActions: EntryActions }) {
  return (
    <Card>
      <div className="flex items-start gap-4">
        <div className="flex shrink-0 flex-col items-center gap-1"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-50 text-sm font-bold text-indigo-700">{index + 1}</span><OrderControls index={index} length={sectionCount} onMove={(direction) => sectionActions.move(index, direction)} /></div>
        <div className="min-w-0 flex-1 space-y-4">
          <div className="grid gap-4 md:grid-cols-2"><Field label="Название раздела"><Input value={section.title} onChange={(event) => sectionActions.update(index, { title: event.target.value })} placeholder="Например, Основы грамматики" /></Field><Field label="Описание"><Input value={section.description} onChange={(event) => sectionActions.update(index, { description: event.target.value })} placeholder="Краткое описание раздела" /></Field></div>
          <div className="space-y-4">{section.units.map((unit, unitIndex) => <CourseUnitForm key={unitIndex} unit={unit} sectionIndex={index} unitIndex={unitIndex} unitCount={section.units.length} content={content} search={search} unitActions={unitActions} entryActions={entryActions} />)}</div>
          <div className="flex flex-wrap gap-3"><Button onClick={() => unitActions.add(index)}>Добавить урок</Button><Button variant="danger" onClick={() => sectionActions.remove(index)}>Удалить раздел</Button></div>
        </div>
      </div>
    </Card>
  );
}

function CourseUnitForm({ unit, sectionIndex, unitIndex, unitCount, content, search, unitActions, entryActions }: { unit: CourseUnitInput; sectionIndex: number; unitIndex: number; unitCount: number; content: ContentOption[]; search: string; unitActions: UnitActions; entryActions: EntryActions }) {
  return (
    <NestedCard>
      <div className="grid gap-3 md:grid-cols-[auto_1fr_1fr_auto]">
        <OrderControls index={unitIndex} length={unitCount} onMove={(direction) => unitActions.move(sectionIndex, unitIndex, direction)} />
        <Input aria-label="Название юнита" value={unit.title} onChange={(event) => unitActions.update(sectionIndex, unitIndex, { title: event.target.value })} placeholder="Название юнита" />
        <Input aria-label="Описание юнита" value={unit.description} onChange={(event) => unitActions.update(sectionIndex, unitIndex, { description: event.target.value })} placeholder="Краткое описание юнита" />
        <Button variant="danger" onClick={() => unitActions.remove(sectionIndex, unitIndex)}>Удалить</Button>
      </div>
      <div className="mt-4 space-y-2">{unit.entries.map((entry, entryIndex) => <CourseEntryForm key={entryIndex} entry={entry} index={entryIndex} length={unit.entries.length} content={content} search={search} onMove={(direction) => entryActions.move(sectionIndex, unitIndex, entryIndex, direction)} onChange={(patch) => entryActions.update(sectionIndex, unitIndex, entryIndex, patch)} onDelete={() => entryActions.remove(sectionIndex, unitIndex, entryIndex)} />)}</div>
      <Button variant="ghost" className="mt-3 text-indigo-700" onClick={() => entryActions.add(sectionIndex, unitIndex)}>+ Добавить материал</Button>
    </NestedCard>
  );
}

function CourseEntryForm({ entry, index, length, content, search, onMove, onChange, onDelete }: { entry: CourseEntryInput; index: number; length: number; content: ContentOption[]; search: string; onMove: (direction: -1 | 1) => void; onChange: (patch: Partial<CourseEntryInput>) => void; onDelete: () => void }) {
  const options = content.filter((option) => option.kind === entry.type && option.title.toLowerCase().includes(search.trim().toLowerCase()));
  return (
    <div className="grid gap-2 md:grid-cols-[auto_150px_1fr_auto]">
      <OrderControls index={index} length={length} onMove={onMove} />
      <Select value={entry.type} onChange={(event) => onChange({ type: event.target.value as CourseEntryInput["type"], contentId: "" })}><option value="article">Статья</option><option value="exercise">Упражнение</option></Select>
      <Select value={entry.contentId} onChange={(event) => onChange({ contentId: event.target.value })}><option value="">Выберите материал</option>{options.map((option) => <option key={option.id} value={option.id}>{option.title} · {statusLabel(option.status)}{option.subtype ? ` · ${option.subtype}` : ""}</option>)}</Select>
      <Button variant="danger" onClick={onDelete}>×</Button>
    </div>
  );
}
