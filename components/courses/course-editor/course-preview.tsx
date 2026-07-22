import type { ContentOption, CourseInput } from "@/lib/content/types";
import { Modal } from "@/components/ui/modal";
import { statusLabel } from "./model";

export function CoursePreview({ course, content, onClose }: { course: CourseInput; content: ContentOption[]; onClose: () => void }) {
  return (
    <Modal title={course.title || "Курс без названия"} eyebrow="Предпросмотр" onClose={onClose} className="max-w-4xl bg-slate-50">
      <p className="text-slate-600">{course.description}</p>
      <div className="mt-6 space-y-4">{course.sections.map((section, sectionIndex) => <section key={sectionIndex} className="rounded-xl border border-slate-200 bg-white p-5"><h3 className="font-semibold">{sectionIndex + 1}. {section.title || "Раздел без названия"}</h3><div className="mt-3 space-y-3">{section.units.map((unit, unitIndex) => <div key={unitIndex} className="border-l-2 border-indigo-100 pl-4"><p className="font-medium">{unit.title || "Урок без названия"}</p><ul className="mt-2 space-y-1 text-sm text-slate-600">{unit.entries.map((entry, entryIndex) => { const item = content.find((option) => option.id === entry.contentId); return <li key={entryIndex}>{entryIndex + 1}. {item?.title ?? "Материал не выбран"} <span className={item?.status === "published" ? "text-emerald-600" : "text-amber-600"}>({item ? statusLabel(item.status) : "ошибка"})</span></li>; })}</ul></div>)}</div></section>)}</div>
    </Modal>
  );
}
