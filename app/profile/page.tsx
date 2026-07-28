"use client";

import Link from "next/link";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth/context";

export default function ProfilePage() {
  const { logout, user } = useAuth();

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-white px-6 py-6 text-slate-950">
        <div className="mx-auto max-w-3xl">
          <div className="mb-6 flex items-center justify-between border-b border-slate-200 pb-4">
            <div>
              <h1 className="text-xl font-semibold">Профиль</h1>
              <p className="mt-1 text-sm text-slate-500">Данные текущего аккаунта</p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/"
                className="inline-flex h-10 items-center justify-center rounded-md border border-slate-300 px-4 text-sm font-medium text-slate-800 transition hover:bg-slate-50"
              >
                На главную
              </Link>
              <Button variant="danger" onClick={logout}>
                Выйти
              </Button>
            </div>
          </div>

          <section className="rounded-lg border border-slate-200 bg-white">
            <dl className="divide-y divide-slate-200">
              <div className="grid gap-1 px-5 py-4 sm:grid-cols-[140px_1fr] sm:gap-6">
                <dt className="text-sm font-medium text-slate-500">Email</dt>
                <dd className="break-words text-sm text-slate-950">{user?.email}</dd>
              </div>
              <div className="grid gap-1 px-5 py-4 sm:grid-cols-[140px_1fr] sm:gap-6">
                <dt className="text-sm font-medium text-slate-500">Роль</dt>
                <dd className="text-sm text-slate-950">{user?.role}</dd>
              </div>
            </dl>
          </section>
        </div>
      </main>
    </ProtectedRoute>
  );
}
