"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createCourse, getManagedCourse, listManagedContent, updateCourse } from "@/lib/content/api";
import type { ContentOption, CourseEntryInput, CourseInput, CourseSectionInput, CourseUnitInput } from "@/lib/content/types";
import { moveItem, replaceItem } from "@/lib/utils/collections";
import { newSection, newUnit } from "./model";

const emptyCourse: CourseInput = { slug: "", title: "", description: "", level: "", status: "draft", sections: [] };

export function useCourseEditor(courseId?: string) {
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
      .then((value) => setCourse({ slug: value.slug, title: value.title, description: value.description, level: value.level ?? "", status: value.status, sections: value.sections.map((section) => ({ title: section.title, description: section.description, units: section.units.map((unit) => ({ title: unit.title, description: unit.description, entries: unit.entries.map((entry) => ({ type: entry.type, contentId: entry.content_id })) })) })) }))
      .catch((error: Error) => setMessage(error.message))
      .finally(() => setLoading(false));
  }, [courseId]);

  function updateCourseState(patch: Partial<CourseInput>) {
    setCourse((current) => ({ ...current, ...patch }));
  }

  function updateSections(change: (sections: CourseSectionInput[]) => CourseSectionInput[]) {
    setCourse((current) => ({ ...current, sections: change(current.sections) }));
  }

  function updateSection(sectionIndex: number, patch: Partial<CourseSectionInput>) {
    updateSections((sections) => replaceItem(sections, sectionIndex, { ...sections[sectionIndex], ...patch }));
  }

  function updateUnit(sectionIndex: number, unitIndex: number, patch: Partial<CourseUnitInput>) {
    const section = course.sections[sectionIndex];
    updateSection(sectionIndex, { units: replaceItem(section.units, unitIndex, { ...section.units[unitIndex], ...patch }) });
  }

  function updateEntry(sectionIndex: number, unitIndex: number, entryIndex: number, patch: Partial<CourseEntryInput>) {
    const unit = course.sections[sectionIndex].units[unitIndex];
    updateUnit(sectionIndex, unitIndex, { entries: replaceItem(unit.entries, entryIndex, { ...unit.entries[entryIndex], ...patch }) });
  }

  const sections = {
    add: () => updateSections((items) => [...items, newSection()]),
    remove: (index: number) => updateSections((items) => items.filter((_, current) => current !== index)),
    move: (index: number, direction: -1 | 1) => updateSections((items) => moveItem(items, index, direction)),
    update: updateSection,
  };

  const units = {
    add: (sectionIndex: number) => updateSection(sectionIndex, { units: [...course.sections[sectionIndex].units, newUnit()] }),
    remove: (sectionIndex: number, unitIndex: number) => updateSection(sectionIndex, { units: course.sections[sectionIndex].units.filter((_, current) => current !== unitIndex) }),
    move: (sectionIndex: number, unitIndex: number, direction: -1 | 1) => updateSection(sectionIndex, { units: moveItem(course.sections[sectionIndex].units, unitIndex, direction) }),
    update: updateUnit,
  };

  const entries = {
    add: (sectionIndex: number, unitIndex: number) => updateUnit(sectionIndex, unitIndex, { entries: [...course.sections[sectionIndex].units[unitIndex].entries, { type: "article", contentId: "" }] }),
    remove: (sectionIndex: number, unitIndex: number, entryIndex: number) => updateUnit(sectionIndex, unitIndex, { entries: course.sections[sectionIndex].units[unitIndex].entries.filter((_, current) => current !== entryIndex) }),
    move: (sectionIndex: number, unitIndex: number, entryIndex: number, direction: -1 | 1) => updateUnit(sectionIndex, unitIndex, { entries: moveItem(course.sections[sectionIndex].units[unitIndex].entries, entryIndex, direction) }),
    update: updateEntry,
  };

  async function save() {
    setSaving(true);
    setMessage(null);
    try {
      const saved = courseId ? await updateCourse(courseId, course) : await createCourse(course);
      if (courseId) setMessage("Изменения сохранены");
      else router.replace(`/admin/courses/${saved.id}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Не удалось сохранить курс");
    } finally {
      setSaving(false);
    }
  }

  return { course, loading, saving, message, content, catalogSearch, preview, setCatalogSearch, setPreview, updateCourse: updateCourseState, sections, units, entries, save };
}

export type CourseEditorController = ReturnType<typeof useCourseEditor>;
