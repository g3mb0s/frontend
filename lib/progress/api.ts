import { authFetch } from "@/lib/auth/auth-fetch";
import type { CourseProgress, ExerciseAttemptResult, LearningEntry } from "./types";
const API = "/api/progress";
export async function getCourseProgress(courseId: string): Promise<CourseProgress> { return read<CourseProgress>(await authFetch(`${API}/courses/${courseId}`)); }
export async function getLearningEntry(courseId: string, entryId: string): Promise<LearningEntry> { const response = await read<{ entry: LearningEntry }>(await authFetch(`${API}/courses/${courseId}/entries/${entryId}`)); return response.entry; }
export async function completeArticleEntry(entryId: string): Promise<CourseProgress> { return read<CourseProgress>(await authFetch(`${API}/course-entries/${entryId}/complete`, { method: "POST" })); }
export interface ExerciseAttemptItem { itemId: string; gaps?: Record<string, string>; pairs?: string[][]; answer?: string[]; }
export async function attemptExercise(entryId: string, items: ExerciseAttemptItem[]): Promise<ExerciseAttemptResult> { return read<ExerciseAttemptResult>(await authFetch(`${API}/course-entries/${entryId}/attempt`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ items }) })); }
async function read<T>(response: Response): Promise<T> { if (!response.ok) { const payload = await response.json().catch(() => ({})) as { message?: string | string[] }; throw new Error(Array.isArray(payload.message) ? payload.message.join(", ") : payload.message ?? "Не удалось обновить прогресс"); } return response.json() as Promise<T>; }
