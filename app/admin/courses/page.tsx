"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ManagerRoute } from "@/components/auth/manager-route";
import { StatusBadge } from "@/components/content/status-badge";
import { AdminNav } from "@/components/layout/admin-nav";
import { AppHeader } from "@/components/layout/app-header";
import { deleteCourse, listManagedCourses, publishCourse } from "@/lib/content/api";
import type { Course } from "@/lib/content/types";

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  async function load() {
    try {
      setCourses(await listManagedCourses());
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Не удалось загрузить курсы");
    }
  }

  useEffect(() => {
    let cancelled = false;
    void listManagedCourses()
      .then((items) => {
        if (!cancelled) setCourses(items);
      })
      .catch((error: Error) => {
        if (!cancelled) setMessage(error.message);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function publish(id: string) {
    try {
      await publishCourse(id);
      setMessage("Курс опубликован");
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Не удалось опубликовать курс");
    }
  }

  async function remove(id: string) {
    if (!window.confirm("Удалить курс вместе со всей структурой?")) return;
    try {
      await deleteCourse(id);
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Не удалось удалить курс");
    }
  }

  return (
    <ManagerRoute>
      <div className="min-h-screen bg-slate-50 text-slate-950">
        <AppHeader />
        <main className="mx-auto max-w-6xl px-6 py-10">
          <AdminNav />
          <div className="flex items-end justify-between gap-6">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-indigo-600">Управление контентом</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight">Курсы</h1>
              <p className="mt-2 text-sm text-slate-500">Черновики, опубликованные и архивные программы.</p>
            </div>
            <Link href="/admin/courses/new" className="rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white">Новый курс</Link>
          </div>

          {message && <p className="mt-6 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">{message}</p>}
          <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {courses.length === 0 ? (
              <p className="p-10 text-center text-sm text-slate-500">Курсов пока нет.</p>
            ) : (
              <div className="divide-y divide-slate-200">
                {courses.map((course) => (
                  <div key={course.id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex items-center gap-3">
                        <h2 className="font-semibold">{course.title}</h2>
                        <StatusBadge status={course.status} />
                      </div>
                      <p className="mt-1 text-sm text-slate-500">/{course.slug} · {course.sections_count} разделов · {course.entries_count} материалов</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link href={`/admin/courses/${course.id}`} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium hover:bg-slate-50">Редактировать</Link>
                      {course.status !== "published" && <button type="button" onClick={() => void publish(course.id)} className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700">Опубликовать</button>}
                      <button type="button" onClick={() => void remove(course.id)} className="rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50">Удалить</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </ManagerRoute>
  );
}
