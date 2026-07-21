"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { MaterialRenderer } from "@/components/content/material-renderer";
import { AppHeader } from "@/components/layout/app-header";
import { getCourse } from "@/lib/content/api";
import type { Course } from "@/lib/content/types";
import { getCourseProgress, getLearningEntry } from "@/lib/progress/api";
import type { CourseProgress, LearningEntry } from "@/lib/progress/types";

export default function LearningPage({ params }: { params: Promise<{ slug: string; entryId: string }> }) {
  const { slug, entryId } = use(params);
  const [course, setCourse] = useState<Course | null>(null);
  const [entry, setEntry] = useState<LearningEntry | null>(null);
  const [progress, setProgress] = useState<CourseProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void getCourse(slug).then(async (courseValue) => {
      setCourse(courseValue);
      const [entryValue, progressValue] = await Promise.all([getLearningEntry(courseValue.id, entryId), getCourseProgress(courseValue.id)]);
      setEntry(entryValue); setProgress(progressValue);
    }).catch((reason) => setError(reason instanceof Error ? reason.message : "Материал недоступен"));
  }, [entryId, slug]);

  async function refreshProgress() { if (course) setProgress(await getCourseProgress(course.id)); }
  const completed = Boolean(progress?.items.some((item) => item.item_type === "entry" && item.item_id === entryId && item.is_completed));
  const nextId = progress?.next_entry_id && progress.next_entry_id !== entryId ? progress.next_entry_id : null;

  return <ProtectedRoute><div className="min-h-screen bg-slate-50 text-slate-950"><AppHeader /><main className="mx-auto max-w-3xl px-6 py-10">
    <div className="flex items-center justify-between gap-4"><Link href={`/courses/${slug}`} className="text-sm font-medium text-slate-500 hover:text-slate-950">← Оглавление курса</Link>{progress && <span className="text-xs font-medium text-slate-500">{progress.completed_entries} из {progress.total_entries} · {progress.progress_percent}%</span>}</div>
    {!entry && !error && <p className="mt-12 text-sm text-slate-500">Загружаем материал…</p>}
    {error && <div className="mt-12 rounded-2xl border border-red-200 bg-red-50 p-6"><h1 className="font-semibold text-red-800">Материал недоступен</h1><p className="mt-2 text-sm text-red-700">{error}</p><Link href={`/courses/${slug}`} className="mt-5 inline-flex rounded-lg bg-white px-4 py-2 text-sm font-medium text-red-700">Вернуться к оглавлению</Link></div>}
    {entry && course && <>
      <header className="mt-8 border-b border-slate-200 pb-6"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-600">{course.title} · {entry.type === "article" ? "Статья" : "Упражнение"}</p><h1 className="mt-3 text-3xl font-bold tracking-tight">{entry.content.title ?? "Материал курса"}</h1></header>
      <article className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"><MaterialRenderer type={entry.type} content={entry.content} entryId={entry.id} completed={completed} onProgress={() => void refreshProgress()} /></article>
      <footer className="mt-8 flex items-center justify-between gap-4 border-t border-slate-200 pt-6"><Link href={`/courses/${slug}`} className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium">К оглавлению</Link>{progress?.is_completed ? <span className="rounded-lg bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700">Курс завершён ✓</span> : nextId && completed ? <Link href={`/courses/${slug}/learn/${nextId}`} className="rounded-lg bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white">Следующий материал →</Link> : <span className="text-sm text-slate-400">Завершите материал, чтобы продолжить</span>}</footer>
    </>}
  </main></div></ProtectedRoute>;
}
