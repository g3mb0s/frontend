"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { AppHeader } from "@/components/layout/app-header";
import { listCourses } from "@/lib/content/api";
import type { Course } from "@/lib/content/types";

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    void listCourses()
      .then((items) => {
        setCourses(items);
        setState("ready");
      })
      .catch(() => setState("error"));
  }, []);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50 text-slate-950">
        <AppHeader />
        <main className="mx-auto max-w-6xl px-6 py-12">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-600">Обучение</p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight">Курсы английского</h1>
            <p className="mt-4 text-lg leading-8 text-slate-600">Последовательные программы из теории и практических упражнений.</p>
          </div>

          {state === "loading" && <p className="mt-12 text-sm text-slate-500">Загружаем курсы…</p>}
          {state === "error" && <p className="mt-12 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">Не удалось загрузить курсы.</p>}
          {state === "ready" && courses.length === 0 && (
            <div className="mt-12 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
              <h2 className="font-semibold">Опубликованных курсов пока нет</h2>
              <p className="mt-2 text-sm text-slate-500">Они появятся здесь после публикации редактором.</p>
            </div>
          )}

          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <Link key={course.id} href={`/courses/${course.slug}`} className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">{course.level ?? "Любой уровень"}</span>
                  <span className="text-sm text-slate-400">{course.entries_count} материалов</span>
                </div>
                <h2 className="mt-5 text-xl font-semibold group-hover:text-indigo-700">{course.title}</h2>
                <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">{course.description || "Описание курса скоро появится."}</p>
                <div className="mt-6 flex gap-4 border-t border-slate-100 pt-4 text-xs font-medium text-slate-500">
                  <span>{course.sections_count} разделов</span>
                  <span>{course.units_count} уроков</span>
                </div>
              </Link>
            ))}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
