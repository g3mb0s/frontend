"use client";

import Link from "next/link";
import { use } from "react";
import { ManagerRoute } from "@/components/auth/manager-route";
import { CourseEditor } from "@/components/courses/course-editor";
import { AppHeader } from "@/components/layout/app-header";

export default function EditCoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <ManagerRoute>
      <div className="min-h-screen bg-slate-50 text-slate-950">
        <AppHeader />
        <main className="mx-auto max-w-5xl px-6 py-10">
          <Link href="/admin/courses" className="text-sm font-medium text-slate-500 hover:text-slate-950">← Курсы</Link>
          <h1 className="mt-4 text-3xl font-bold tracking-tight">Редактирование курса</h1>
          <div className="mt-8"><CourseEditor courseId={id} /></div>
        </main>
      </div>
    </ManagerRoute>
  );
}
