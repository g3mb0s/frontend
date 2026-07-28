"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth/context";

export function AdminNav() {
  const { user } = useAuth();

  return (
    <nav className="mb-8 flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
      <Link href="/admin/courses" className={linkClass}>Курсы</Link>
      <Link href="/admin/articles" className={linkClass}>Статьи</Link>
      <Link href="/admin/exercises" className={linkClass}>Упражнения</Link>
      {user?.role === "admin" && <Link href="/admin/characters" className={linkClass}>AI-персонажи</Link>}
    </nav>
  );
}

const linkClass = "rounded-lg px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-indigo-50 hover:text-indigo-700";
