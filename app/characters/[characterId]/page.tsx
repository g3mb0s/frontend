"use client";

import { use } from "react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { CharacterChat } from "@/components/characters/character-chat";
import { AppHeader } from "@/components/layout/app-header";

export default function CharacterPage({
  params,
}: {
  params: Promise<{ characterId: string }>;
}) {
  const { characterId } = use(params);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-100">
        <AppHeader />
        <CharacterChat characterId={characterId} />
      </div>
    </ProtectedRoute>
  );
}
