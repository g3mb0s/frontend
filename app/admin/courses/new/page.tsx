import Link from "next/link";
import { ManagerRoute } from "@/components/auth/manager-route";
import { CourseEditor } from "@/components/courses/course-editor";
import { AppHeader } from "@/components/layout/app-header";

export default function NewCoursePage() {
  return (
    <ManagerRoute>
      <div className="min-h-screen bg-slate-50 text-slate-950">
        <AppHeader />
        <main className="mx-auto max-w-5xl px-6 py-10">
          <Link href="/admin/courses" className="text-sm font-medium text-slate-500 hover:text-slate-950">← Курсы</Link>
          <h1 className="mt-4 text-3xl font-bold tracking-tight">Новый курс</h1>
          <div className="mt-8"><CourseEditor /></div>
        </main>
      </div>
    </ManagerRoute>
  );
}
