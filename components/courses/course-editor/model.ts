import type { ContentStatus, CourseSectionInput, CourseUnitInput } from "@/lib/content/types";

export function newSection(): CourseSectionInput {
  return { title: "", description: "", units: [] };
}

export function newUnit(): CourseUnitInput {
  return { title: "", description: "", entries: [] };
}

export function statusLabel(status: ContentStatus) {
  return status === "published" ? "опубликован" : status === "archived" ? "архив" : "черновик";
}
