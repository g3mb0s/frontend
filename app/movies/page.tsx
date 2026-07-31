import { MovieCatalog } from "@/components/movies/movie-catalog";
import { AppHeader } from "@/components/layout/app-header";

export default function MoviesPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <AppHeader />
      <main className="mx-auto max-w-6xl px-6 py-12">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-600">Видео</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight">Фильмы с субтитрами</h1>
        <p className="mt-4 text-slate-600">Смотрите фильм целиком или повторяйте короткие фрагменты.</p>
        <MovieCatalog />
      </main>
    </div>
  );
}
