import { ProtectedRoute } from "@/components/auth/protected-route";
import Link from "next/link";
import { AppHeader } from "@/components/layout/app-header";

export default function Home() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50 text-slate-950">
        <AppHeader />
        <main className="mx-auto max-w-6xl px-6 py-16">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-600">Учись последовательно</p>
            <h1 className="mt-4 text-5xl font-bold tracking-tight">Английский через теорию и практику</h1>
            <p className="mt-5 text-lg leading-8 text-slate-600">Изучай темы, выполняй упражнения и собирай знания в единую систему.</p>
            <Link href="/courses" className="mt-8 inline-flex rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700">Открыть курсы</Link>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
