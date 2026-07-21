"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createCourse, getManagedCourse, listManagedContent, updateCourse } from "@/lib/content/api";
import type { ContentOption, CourseInput, CourseSectionInput, ContentStatus } from "@/lib/content/types";

const emptyCourse: CourseInput = {
  slug: "",
  title: "",
  description: "",
  level: "",
  status: "draft",
  sections: [],
};

export function CourseEditor({ courseId }: { courseId?: string }) {
  const router = useRouter();
  const [course, setCourse] = useState<CourseInput>(emptyCourse);
  const [loading, setLoading] = useState(Boolean(courseId));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [content, setContent] = useState<ContentOption[]>([]);
  const [catalogSearch, setCatalogSearch] = useState("");
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    void listManagedContent().then(setContent).catch((error: Error) => setMessage(error.message));
  }, []);

  useEffect(() => {
    if (!courseId) return;
    void getManagedCourse(courseId)
      .then((value) => {
        setCourse({
          slug: value.slug,
          title: value.title,
          description: value.description,
          level: value.level ?? "",
          status: value.status,
          sections: value.sections.map((section) => ({
            title: section.title,
            description: section.description,
            units: section.units.map((unit) => ({
              title: unit.title,
              description: unit.description,
              entries: unit.entries.map((entry) => ({ type: entry.type, contentId: entry.content_id })),
            })),
          })),
        });
        setLoading(false);
      })
      .catch((error: Error) => {
        setMessage(error.message);
        setLoading(false);
      });
  }, [courseId]);

  async function save() {
    setSaving(true);
    setMessage(null);
    try {
      const saved = courseId ? await updateCourse(courseId, course) : await createCourse(course);
      if (!courseId) {
        router.replace(`/admin/courses/${saved.id}`);
      } else {
        setMessage("Изменения сохранены");
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Не удалось сохранить курс");
    } finally {
      setSaving(false);
    }
  }

  function updateSection(index: number, next: CourseSectionInput) {
    setCourse((current) => ({
      ...current,
      sections: current.sections.map((section, sectionIndex) => (sectionIndex === index ? next : section)),
    }));
  }

  if (loading) return <p className="py-12 text-sm text-slate-500">Загружаем редактор…</p>;

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Название">
            <input value={course.title} onChange={(event) => setCourse({ ...course, title: event.target.value })} className={inputClass} placeholder="Основы английского" />
          </Field>
          <Field label="Slug">
            <input value={course.slug} onChange={(event) => setCourse({ ...course, slug: event.target.value })} className={inputClass} placeholder="english-basics" />
          </Field>
          <Field label="Уровень">
            <input value={course.level} onChange={(event) => setCourse({ ...course, level: event.target.value })} className={inputClass} placeholder="A1" />
          </Field>
          <Field label="Статус">
            <select value={course.status} onChange={(event) => setCourse({ ...course, status: event.target.value as ContentStatus })} className={inputClass}>
              <option value="draft">Черновик</option>
              <option value="archived">Архив</option>
              <option value="published">Опубликован</option>
            </select>
          </Field>
        </div>
        <div className="mt-5">
          <Field label="Описание">
            <textarea value={course.description} onChange={(event) => setCourse({ ...course, description: event.target.value })} className={`${inputClass} min-h-28 resize-y`} placeholder="Кратко опишите содержание и результат курса" />
          </Field>
        </div>
      </section>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Структура курса</h2>
          <p className="mt-1 text-sm text-slate-500">Разделы содержат уроки, а уроки — статьи и упражнения.</p>
        </div>
        <button type="button" onClick={() => setCourse({ ...course, sections: [...course.sections, newSection()] })} className={secondaryButton}>Добавить раздел</button>
      </div>

      <label className="block rounded-xl border border-slate-200 bg-white p-4 text-sm font-medium text-slate-700">
        <span className="mb-2 block">Поиск по каталогу материалов</span>
        <input value={catalogSearch} onChange={(event) => setCatalogSearch(event.target.value)} className={inputClass} placeholder="Название статьи или упражнения" />
      </label>

      {course.sections.length === 0 && <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">Добавьте первый раздел курса.</div>}

      {course.sections.map((section, sectionIndex) => (
        <section key={sectionIndex} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="flex shrink-0 flex-col items-center gap-1">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-50 text-sm font-bold text-indigo-700">{sectionIndex + 1}</span>
              <OrderButtons index={sectionIndex} length={course.sections.length} onMove={(direction) => setCourse({ ...course, sections: moveItem(course.sections, sectionIndex, direction) })} />
            </div>
            <div className="min-w-0 flex-1 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Название раздела">
                  <input value={section.title} onChange={(event) => updateSection(sectionIndex, { ...section, title: event.target.value })} className={inputClass} placeholder="Например, Основы грамматики" />
                </Field>
                <Field label="Описание">
                  <input value={section.description} onChange={(event) => updateSection(sectionIndex, { ...section, description: event.target.value })} className={inputClass} placeholder="Краткое описание раздела" />
                </Field>
              </div>

              <div className="space-y-4">
                {section.units.map((unit, unitIndex) => (
                  <div key={unitIndex} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div className="grid gap-3 md:grid-cols-[auto_1fr_1fr_auto]">
                      <OrderButtons index={unitIndex} length={section.units.length} onMove={(direction) => updateSection(sectionIndex, { ...section, units: moveItem(section.units, unitIndex, direction) })} />
                      <input aria-label="Название юнита" value={unit.title} onChange={(event) => updateSection(sectionIndex, { ...section, units: section.units.map((item, index) => index === unitIndex ? { ...item, title: event.target.value } : item) })} className={inputClass} placeholder="Название юнита" />
                      <input aria-label="Описание юнита" value={unit.description} onChange={(event) => updateSection(sectionIndex, { ...section, units: section.units.map((item, index) => index === unitIndex ? { ...item, description: event.target.value } : item) })} className={inputClass} placeholder="Краткое описание юнита" />
                      <button type="button" onClick={() => updateSection(sectionIndex, { ...section, units: section.units.filter((_, index) => index !== unitIndex) })} className="px-2 text-sm font-medium text-red-600">Удалить</button>
                    </div>

                    <div className="mt-4 space-y-2">
                      {unit.entries.map((entry, entryIndex) => (
                        <div key={entryIndex} className="grid gap-2 md:grid-cols-[auto_150px_1fr_auto]">
                          <OrderButtons index={entryIndex} length={unit.entries.length} onMove={(direction) => updateSection(sectionIndex, { ...section, units: section.units.map((item, index) => index === unitIndex ? { ...item, entries: moveItem(item.entries, entryIndex, direction) } : item) })} />
                          <select value={entry.type} onChange={(event) => updateSection(sectionIndex, { ...section, units: section.units.map((item, index) => index === unitIndex ? { ...item, entries: item.entries.map((currentEntry, currentIndex) => currentIndex === entryIndex ? { ...currentEntry, type: event.target.value as "article" | "exercise", contentId: "" } : currentEntry) } : item) })} className={inputClass}>
                            <option value="article">Статья</option>
                            <option value="exercise">Упражнение</option>
                          </select>
                          <select value={entry.contentId} onChange={(event) => updateSection(sectionIndex, { ...section, units: section.units.map((item, index) => index === unitIndex ? { ...item, entries: item.entries.map((currentEntry, currentIndex) => currentIndex === entryIndex ? { ...currentEntry, contentId: event.target.value } : currentEntry) } : item) })} className={inputClass}>
                            <option value="">Выберите материал</option>
                            {content
                              .filter((option) => option.kind === entry.type && option.title.toLowerCase().includes(catalogSearch.trim().toLowerCase()))
                              .map((option) => <option key={option.id} value={option.id}>{option.title} · {statusLabel(option.status)}{option.subtype ? ` · ${option.subtype}` : ""}</option>)}
                          </select>
                          <button type="button" onClick={() => updateSection(sectionIndex, { ...section, units: section.units.map((item, index) => index === unitIndex ? { ...item, entries: item.entries.filter((_, currentIndex) => currentIndex !== entryIndex) } : item) })} className="px-2 text-sm text-red-600">×</button>
                        </div>
                      ))}
                    </div>
                    <button type="button" onClick={() => updateSection(sectionIndex, { ...section, units: section.units.map((item, index) => index === unitIndex ? { ...item, entries: [...item.entries, { type: "article", contentId: "" }] } : item) })} className="mt-3 text-sm font-medium text-indigo-700">+ Добавить материал</button>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-3">
                <button type="button" onClick={() => updateSection(sectionIndex, { ...section, units: [...section.units, newUnit()] })} className={secondaryButton}>Добавить урок</button>
                <button type="button" onClick={() => setCourse({ ...course, sections: course.sections.filter((_, index) => index !== sectionIndex) })} className="rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50">Удалить раздел</button>
              </div>
            </div>
          </div>
        </section>
      ))}

      <div className="sticky bottom-4 flex items-center justify-between rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-lg backdrop-blur">
        <p className={`text-sm ${message?.includes("сохранены") ? "text-emerald-700" : "text-red-600"}`}>{message}</p>
        <div className="flex gap-2">
          <button type="button" onClick={() => setPreview(true)} className={secondaryButton}>Предпросмотр</button>
          <button type="button" disabled={saving} onClick={() => void save()} className="rounded-lg bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{saving ? "Сохраняем…" : "Сохранить"}</button>
        </div>
      </div>

      {preview && <CoursePreview course={course} content={content} onClose={() => setPreview(false)} />}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block text-sm font-medium text-slate-700"><span className="mb-2 block">{label}</span>{children}</label>;
}

function newSection(): CourseSectionInput {
  return { title: "", description: "", units: [] };
}

function newUnit() {
  return { title: "", description: "", entries: [] };
}

function OrderButtons({ index, length, onMove }: { index: number; length: number; onMove: (direction: -1 | 1) => void }) {
  return (
    <div className="flex gap-1">
      <button type="button" disabled={index === 0} onClick={() => onMove(-1)} className="rounded px-1.5 py-1 text-xs text-slate-500 hover:bg-slate-200 disabled:opacity-25" aria-label="Переместить вверх">↑</button>
      <button type="button" disabled={index === length - 1} onClick={() => onMove(1)} className="rounded px-1.5 py-1 text-xs text-slate-500 hover:bg-slate-200 disabled:opacity-25" aria-label="Переместить вниз">↓</button>
    </div>
  );
}

function moveItem<T>(items: T[], index: number, direction: -1 | 1) {
  const target = index + direction;
  if (target < 0 || target >= items.length) return items;
  const next = [...items];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

function CoursePreview({ course, content, onClose }: { course: CourseInput; content: ContentOption[]; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="mx-auto my-8 max-w-4xl rounded-3xl bg-slate-50 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div><p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">Предпросмотр</p><h2 className="mt-1 text-xl font-bold">{course.title || "Курс без названия"}</h2></div>
          <button type="button" onClick={onClose} className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-slate-200">Закрыть</button>
        </div>
        <div className="p-6">
          <p className="text-slate-600">{course.description}</p>
          <div className="mt-6 space-y-4">
            {course.sections.map((section, sectionIndex) => (
              <section key={sectionIndex} className="rounded-xl border border-slate-200 bg-white p-5">
                <h3 className="font-semibold">{sectionIndex + 1}. {section.title || "Раздел без названия"}</h3>
                <div className="mt-3 space-y-3">
                  {section.units.map((unit, unitIndex) => (
                    <div key={unitIndex} className="border-l-2 border-indigo-100 pl-4">
                      <p className="font-medium">{unit.title || "Урок без названия"}</p>
                      <ul className="mt-2 space-y-1 text-sm text-slate-600">
                        {unit.entries.map((entry, entryIndex) => {
                          const item = content.find((option) => option.id === entry.contentId);
                          return <li key={entryIndex}>{entryIndex + 1}. {item?.title ?? "Материал не выбран"} <span className={item?.status === "published" ? "text-emerald-600" : "text-amber-600"}>({item ? statusLabel(item.status) : "ошибка"})</span></li>;
                        })}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function statusLabel(status: ContentStatus) {
  return status === "published" ? "опубликован" : status === "archived" ? "архив" : "черновик";
}

const inputClass = "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100";
const secondaryButton = "rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50";
