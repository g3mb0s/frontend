"use client";

import Link from "next/link";
import { use } from "react";
import { ManagerRoute } from "@/components/auth/manager-route";
import { AppHeader } from "@/components/layout/app-header";
import { MovieEditor } from "@/components/movies/movie-editor";

export default function EditMoviePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <ManagerRoute>
      <div className="min-h-screen bg-slate-50 text-slate-950">
        <AppHeader />
        <main className="mx-auto max-w-6xl px-6 py-10">
          <Link href="/admin/movies" className="text-sm font-medium text-slate-500 hover:text-slate-950">← Фильмы</Link>
          <h1 className="mt-4 text-3xl font-bold tracking-tight">Редактирование фильма</h1>
          <div className="mt-8"><MovieEditor movieId={id} /></div>
        </main>
      </div>
    </ManagerRoute>
  );
}
