export interface ItemProgress { item_id: string; item_type: "course" | "section" | "unit" | "entry"; is_completed: boolean; was_failed: boolean; was_fail_fixed: boolean; }
import type { CourseEntryContent } from "@/lib/content/types";
export interface CourseProgress { course_id: string; total_entries: number; completed_entries: number; progress_percent: number; is_completed: boolean; next_entry_id: string | null; items: ItemProgress[]; }
export interface ExerciseAttemptResult { passed: boolean; correct: number; total: number; score: number; details: Array<{ itemId: string; key?: string; correct: boolean }>; course_progress: CourseProgress; }
export interface LearningEntry { id: string; type: "article" | "exercise"; content_id: string; content: CourseEntryContent; }
