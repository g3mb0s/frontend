"use client";

import { ManagerRoute } from "@/components/auth/manager-route";
import { AdminNav } from "@/components/layout/admin-nav";
import { AppHeader } from "@/components/layout/app-header";
import { MovieManager } from "@/components/movies/movie-manager";

export default function AdminMoviesPage() {
  return (
    <ManagerRoute>
      <div className="min-h-screen bg-slate-50 text-slate-950">
        <AppHeader />
        <main className="mx-auto max-w-6xl px-6 py-10">
          <AdminNav />
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-indigo-600">Управление контентом</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">Фильмы</h1>
          <p className="mt-2 text-sm text-slate-500">Загрузите видео и синхронные русские и английские SRT-файлы.</p>
          <MovieManager />
        </main>
      </div>
    </ManagerRoute>
  );
}
