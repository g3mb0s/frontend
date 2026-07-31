import Link from "next/link";
import { AppHeader } from "@/components/layout/app-header";
import { MovieView } from "@/components/movies/movie-view";

export default async function MoviePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <AppHeader />
      <main className="mx-auto max-w-6xl px-6 py-10">
        <Link href="/movies" className="text-sm font-medium text-slate-500 hover:text-slate-950">← Все фильмы</Link>
        <div className="mt-6"><MovieView movieId={id} /></div>
      </main>
    </div>
  );
}
