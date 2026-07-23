"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { CharacterAvatar } from "@/components/characters/character-avatar";
import { AppHeader } from "@/components/layout/app-header";
import { listCharacters } from "@/lib/characters/api";
import type { CharacterDefinition } from "@/lib/characters/types";

export default function CharactersPage() {
  const [characters, setCharacters] = useState<CharacterDefinition[]>([]);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void listCharacters()
        .then((items) => {
          setCharacters(items);
          setState("ready");
        })
        .catch(() => setState("error"));
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, []);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50 text-slate-950">
        <AppHeader />
        <main className="mx-auto max-w-6xl px-6 py-12">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-600">English roleplay</p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight">Talk to AI characters</h1>
            <p className="mt-4 text-lg leading-8 text-slate-600">Practise short, natural conversations and receive instant grammar feedback on every message.</p>
          </div>
          {state === "loading" && <p className="mt-12 text-sm text-slate-500">Loading characters…</p>}
          {state === "error" && <p className="mt-12 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">Could not load characters.</p>}
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {characters.map((character) => (
              <Link key={character.id} href={`/characters/${character.id}`} className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-sky-300 hover:shadow-xl">
                <div className="flex items-center gap-5 bg-gradient-to-br from-sky-50 to-white p-6">
                  <CharacterAvatar size="lg" />
                  <div>
                    <span className="rounded-full bg-sky-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-sky-700">AI character</span>
                    <h2 className="mt-3 text-xl font-bold group-hover:text-sky-700">{character.name}</h2>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-sm leading-6 text-slate-600">{character.description}</p>
                  <p className="mt-5 text-sm font-semibold text-sky-700">Start conversation →</p>
                  <p className="mt-4 border-t border-slate-100 pt-4 text-[10px] leading-4 text-slate-400">{character.disclaimer}</p>
                </div>
              </Link>
            ))}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
