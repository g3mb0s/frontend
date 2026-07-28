"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useAuth } from "@/lib/auth/context";
import { ProtectedRoute } from "./protected-route";

export function AdminRoute({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  return (
    <ProtectedRoute>
      {user?.role === "admin" ? (
        children
      ) : (
        <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
          <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <h1 className="text-xl font-semibold text-slate-950">Нет доступа</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Управление AI-персонажами доступно только администраторам.
            </p>
            <Link
              href="/characters"
              className="mt-6 inline-flex rounded-lg bg-slate-950 px-4 py-2 text-sm font-medium text-white"
            >
              Перейти к персонажам
            </Link>
          </div>
        </main>
      )}
    </ProtectedRoute>
  );
}
