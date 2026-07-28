"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth/context";

export function AppHeader() {
  const { logout, user } = useAuth();
  const canManage = user?.role === "manager" || user?.role === "admin";

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-3 py-4 sm:gap-6 sm:px-6">
        <Link href="/" className="shrink-0 text-lg font-bold tracking-tight text-slate-950">
          Gembos
        </Link>
        <nav className="flex min-w-0 items-center gap-1 overflow-x-auto text-sm font-medium sm:gap-2">
          <Link href="/courses" className="rounded-lg px-3 py-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-950">
            Курсы
          </Link>
          <Link href="/chat" className="rounded-lg px-3 py-2 text-slate-600 transition hover:bg-indigo-50 hover:text-indigo-700">
            ИИ-чат
          </Link>
          <Link href="/characters" className="rounded-lg px-3 py-2 text-slate-600 transition hover:bg-sky-50 hover:text-sky-700">
            Персонажи
          </Link>
          {canManage && (
            <Link href="/admin/courses" className="rounded-lg px-3 py-2 text-indigo-700 transition hover:bg-indigo-50">
              Админка
            </Link>
          )}
          <Link href="/profile" className="rounded-lg border border-slate-200 px-3 py-2 text-slate-700 transition hover:bg-slate-50">
            Профиль
          </Link>
          <Button variant="ghost" onClick={logout}>
            Выйти
          </Button>
        </nav>
      </div>
    </header>
  );
}
