"use client";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { AppHeader } from "@/components/layout/app-header";
import { StudiedClips } from "@/components/movies/studied-clips";

export default function ClipsPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50 text-slate-950">
        <AppHeader />
        <main className="mx-auto max-w-6xl px-6 py-12">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-600">Повторение</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight">Добавленные клипы</h1>
          <p className="mt-4 text-slate-600">Здесь появятся фрагменты, которые вы добавили для будущих интервальных повторений.</p>
          <StudiedClips />
        </main>
      </div>
    </ProtectedRoute>
  );
}
