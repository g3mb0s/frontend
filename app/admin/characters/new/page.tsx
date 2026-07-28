"use client";

import Link from "next/link";
import { AdminRoute } from "@/components/auth/admin-route";
import { CharacterEditor } from "@/components/characters/admin/character-editor";
import { AppHeader } from "@/components/layout/app-header";

export default function NewCharacterPage() {
  return (
    <AdminRoute>
      <div className="min-h-screen bg-slate-50">
        <AppHeader />
        <main className="mx-auto max-w-5xl px-6 py-10">
          <Link href="/admin/characters" className="text-sm text-slate-500">← AI-персонажи</Link>
          <h1 className="mt-4 text-3xl font-bold">Новый AI-персонаж</h1>
          <p className="mt-2 text-sm text-slate-500">ID нельзя будет изменить после создания.</p>
          <div className="mt-8"><CharacterEditor /></div>
        </main>
      </div>
    </AdminRoute>
  );
}
