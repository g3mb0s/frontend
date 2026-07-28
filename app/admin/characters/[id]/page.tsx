"use client";

import Link from "next/link";
import { use } from "react";
import { AdminRoute } from "@/components/auth/admin-route";
import { CharacterEditor } from "@/components/characters/admin/character-editor";
import { AppHeader } from "@/components/layout/app-header";

export default function EditCharacterPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return (
    <AdminRoute>
      <div className="min-h-screen bg-slate-50">
        <AppHeader />
        <main className="mx-auto max-w-5xl px-6 py-10">
          <Link href="/admin/characters" className="text-sm text-slate-500">← AI-персонажи</Link>
          <h1 className="mt-4 text-3xl font-bold">Редактирование персонажа</h1>
          <div className="mt-8"><CharacterEditor characterId={id} /></div>
        </main>
      </div>
    </AdminRoute>
  );
}
