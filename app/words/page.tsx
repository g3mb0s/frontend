import { ProtectedRoute } from "@/components/auth/protected-route";
import { AppHeader } from "@/components/layout/app-header";
import { WordStudy } from "@/components/words";

export default function WordsPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50 text-slate-950">
        <AppHeader />
        <main className="mx-auto max-w-6xl px-6 py-12">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-600">Слова</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight">Изучение слов</h1>
          <p className="mt-4 text-slate-600">Учите новые слова и повторяйте их интервальным методом.</p>
          <div className="mt-8"><WordStudy /></div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
