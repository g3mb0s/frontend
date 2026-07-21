"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { ProtectedRoute } from "./protected-route";
import { useAuth } from "@/lib/auth/context";

export function ManagerRoute({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const canManage = user?.role === "manager" || user?.role === "admin";

  return (
    <ProtectedRoute>
      {canManage ? (
        children
      ) : (
        <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
          <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <h1 className="text-xl font-semibold text-slate-950">Нет доступа</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">Редактор курсов доступен менеджерам и администраторам.</p>
            <Link href="/courses" className="mt-6 inline-flex rounded-lg bg-slate-950 px-4 py-2 text-sm font-medium text-white">
              Перейти к курсам
            </Link>
          </div>
        </main>
      )}
    </ProtectedRoute>
  );
}
