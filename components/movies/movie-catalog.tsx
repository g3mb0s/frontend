"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { listMovies } from "@/lib/content/api";
import type { Movie } from "@/lib/content/types";

export function MovieCatalog() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    void listMovies()
      .then((items) => {
        setMovies(items);
        setState("ready");
      })
      .catch(() => setState("error"));
  }, []);

  if (state === "loading") return <p className="mt-10 text-sm text-slate-500">Загружаем фильмы…</p>;
  if (state === "error") return <p className="mt-10 rounded-xl bg-red-50 p-4 text-sm text-red-700">Не удалось загрузить фильмы.</p>;
  if (!movies.length) return <p className="mt-10 rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">Готовых фильмов пока нет.</p>;

  return (
    <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {movies.map((movie) => (
        <Link key={movie.id} href={`/movies/${movie.id}`} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-indigo-300 hover:shadow-md">
          <h2 className="text-lg font-semibold text-slate-950">{movie.title}</h2>
          <p className="mt-3 text-sm text-slate-500">{movie.clips.length} клипов · {formatDuration(movie.duration_ms)}</p>
        </Link>
      ))}
    </div>
  );
}

function formatDuration(durationMs: number | null) {
  if (!durationMs) return "длительность неизвестна";
  const minutes = Math.round(durationMs / 60_000);
  return `${minutes} мин`;
}
