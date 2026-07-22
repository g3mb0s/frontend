"use client";

import { EditorActions } from "@/components/ui/editor-actions";
import { CourseGeneralForm } from "./course-general-form";
import { CoursePreview } from "./course-preview";
import { CourseStructureForm } from "./course-structure-form";
import { useCourseEditor } from "./use-course-editor";

export function CourseEditor({ courseId }: { courseId?: string }) {
  const editor = useCourseEditor(courseId);

  if (editor.loading) return <p className="py-12 text-sm text-slate-500">Загружаем редактор…</p>;

  return (
    <div className="space-y-6">
      <CourseGeneralForm course={editor.course} onChange={editor.updateCourse} />
      <CourseStructureForm sections={editor.course.sections} content={editor.content} search={editor.catalogSearch} onSearchChange={editor.setCatalogSearch} sectionActions={editor.sections} unitActions={editor.units} entryActions={editor.entries} />
      <EditorActions message={editor.message} saving={editor.saving} onPreview={() => editor.setPreview(true)} onSave={() => void editor.save()} />
      {editor.preview && <CoursePreview course={editor.course} content={editor.content} onClose={() => editor.setPreview(false)} />}
    </div>
  );
}
