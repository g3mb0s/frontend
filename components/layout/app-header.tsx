"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth/context";

export function AppHeader() {
  const { user } = useAuth();
  const canManage = user?.role === "manager" || user?.role === "admin";

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-4">
        <Link href="/" className="text-lg font-bold tracking-tight text-slate-950">
          Gembos
        </Link>
        <nav className="flex items-center gap-2 text-sm font-medium">
          <Link href="/courses" className="rounded-lg px-3 py-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-950">
            Курсы
          </Link>
          {canManage && (
            <Link href="/admin/courses" className="rounded-lg px-3 py-2 text-indigo-700 transition hover:bg-indigo-50">
              Админка
            </Link>
          )}
          <Link href="/profile" className="rounded-lg border border-slate-200 px-3 py-2 text-slate-700 transition hover:bg-slate-50">
            Профиль
          </Link>
        </nav>
      </div>
    </header>
  );
}
