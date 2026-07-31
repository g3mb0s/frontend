"use client";

import { useEffect, useState } from "react";
import { getMovie } from "@/lib/content/api";
import type { Movie } from "@/lib/content/types";
import { MoviePlayer } from "./movie-player";

export function MovieView({ movieId }: { movieId: string }) {
  const [movie, setMovie] = useState<Movie | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void getMovie(movieId).then(setMovie).catch((reason: Error) => setError(reason.message));
  }, [movieId]);

  if (error) return <p className="mt-10 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>;
  if (!movie) return <p className="mt-10 text-sm text-slate-500">Загружаем фильм…</p>;
  return (
    <>
      <h1 className="mb-8 text-3xl font-bold tracking-tight">{movie.title}</h1>
      <MoviePlayer movie={movie} />
    </>
  );
}
