"use client";

import Link from "next/link";
import { use, useEffect, useMemo, useState } from "react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { AppHeader } from "@/components/layout/app-header";
import { getCourse } from "@/lib/content/api";
import type { Course } from "@/lib/content/types";
import { getCourseProgress } from "@/lib/progress/api";
import type { CourseProgress } from "@/lib/progress/types";

export default function CoursePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [course, setCourse] = useState<Course | null>(null);
  const [progress, setProgress] = useState<CourseProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void getCourse(slug).then(async (value) => {
      setCourse(value);
      try { setProgress(await getCourseProgress(value.id)); } catch (reason) { setError(reason instanceof Error ? reason.message : "Не удалось загрузить прогресс"); }
    }).catch(() => setError("Курс не найден или ещё не опубликован."));
  }, [slug]);

  const orderedEntries = useMemo(() => course ? course.sections.flatMap((section) => section.units.flatMap((unit) => unit.entries)) : [], [course]);
  const nextEntryId = progress?.next_entry_id ?? orderedEntries[0]?.id ?? null;

  return <ProtectedRoute><div className="min-h-screen bg-slate-50 text-slate-950"><AppHeader /><main className="mx-auto max-w-5xl px-6 py-10">
    <Link href="/courses" className="text-sm font-medium text-slate-500 hover:text-slate-950">← Все курсы</Link>
    {!course && !error && <p className="mt-8 text-sm text-slate-500">Загружаем курс…</p>}
    {error && !course && <p className="mt-8 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">{error}</p>}
    {course && <>
      <section className="mt-8 rounded-3xl bg-slate-950 px-8 py-10 text-white sm:px-12">
        <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold">{course.level ?? "Любой уровень"}</span>
        <h1 className="mt-5 max-w-3xl text-4xl font-bold tracking-tight">{course.title}</h1>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          {nextEntryId && !progress?.is_completed && <Link href={`/courses/${course.slug}/learn/${nextEntryId}`} className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-950 hover:bg-indigo-50">{progress?.completed_entries ? "Продолжить" : "Начать курс"}</Link>}
          {progress?.is_completed && <span className="rounded-xl bg-emerald-500/20 px-5 py-3 text-sm font-semibold text-emerald-200">Курс завершён ✓</span>}
        </div>
        {progress && <div className="mt-7"><div className="mb-2 flex justify-between text-xs text-slate-300"><span>Прогресс</span><span>{progress.progress_percent}%</span></div><div className="h-2 overflow-hidden rounded-full bg-white/15"><div className="h-full rounded-full bg-indigo-400 transition-all" style={{ width: `${progress.progress_percent}%` }} /></div></div>}
      </section>

      {error && <p className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">{error}</p>}
      <div className="mt-8 space-y-6">
        {course.sections.map((section, sectionIndex) => <section key={section.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex gap-4"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-sm font-bold text-indigo-700">{sectionIndex + 1}</span><div className="min-w-0 flex-1"><h2 className="text-xl font-semibold">{section.title}</h2><ol className="mt-4 space-y-2">{section.units.map((unit, unitIndex) => <li key={unit.id} className="flex items-center gap-3 rounded-lg bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700"><span className="text-xs text-slate-400">{sectionIndex + 1}.{unitIndex + 1}</span>{unit.title}</li>)}</ol></div></div></section>)}
      </div>
    </>}
  </main></div></ProtectedRoute>;
}
