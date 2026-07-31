"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/form-controls";
import { deleteMovie, listManagedMovies, reprocessMovie, uploadMovie } from "@/lib/content/api";
import type { Movie, MovieStatus } from "@/lib/content/types";

export function MovieManager() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const load = useCallback(async () => {
    try {
      setMovies(await listManagedMovies());
      setMessage(null);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Не удалось загрузить фильмы");
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  useEffect(() => {
    if (!movies.some((movie) => movie.status === "queued" || movie.status === "processing")) return;
    const timer = window.setInterval(() => void load(), 5000);
    return () => window.clearInterval(timer);
  }, [load, movies]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setUploading(true);
    setProgress(0);
    setMessage(null);
    try {
      await uploadMovie(new FormData(form), setProgress);
      form.reset();
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Не удалось загрузить фильм");
    } finally {
      setUploading(false);
    }
  }

  async function retry(id: string) {
    try {
      await reprocessMovie(id);
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Не удалось перезапустить обработку");
    }
  }

  async function remove(id: string) {
    if (!window.confirm("Удалить фильм и все его файлы?")) return;
    try {
      await deleteMovie(id);
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Не удалось удалить фильм");
    }
  }

  return (
    <>
      <form onSubmit={submit} className="mt-8 grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <Field label="Название"><Input name="title" required disabled={uploading} /></Field>
        <Field label="Видео"><Input name="video" type="file" accept="video/*" required disabled={uploading} /></Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Русские субтитры"><Input name="subtitlesRu" type="file" accept=".srt,application/x-subrip,text/plain" required disabled={uploading} /></Field>
          <Field label="Английские субтитры"><Input name="subtitlesEn" type="file" accept=".srt,application/x-subrip,text/plain" required disabled={uploading} /></Field>
        </div>
        {uploading && (
          <div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full bg-indigo-600 transition-all" style={{ width: `${progress}%` }} /></div>
            <p className="mt-2 text-xs text-slate-500">Загрузка: {progress}%</p>
          </div>
        )}
        <Button type="submit" variant="primary" disabled={uploading} className="justify-self-start">{uploading ? "Загружаем…" : "Загрузить фильм"}</Button>
      </form>
      {message && <p className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-700">{message}</p>}
      <div className="mt-8 divide-y divide-slate-200 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {!movies.length && <p className="p-8 text-center text-sm text-slate-500">Фильмов пока нет.</p>}
        {movies.map((movie) => (
          <div key={movie.id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-3"><h2 className="font-semibold">{movie.title}</h2><MovieStatusBadge status={movie.status} /></div>
              <p className="mt-1 text-sm text-slate-500">{movie.clips.length} клипов{movie.error_message ? ` · ${movie.error_message}` : ""}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {movie.status === "ready" && <Link href={`/movies/${movie.id}`} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium hover:bg-slate-50">Смотреть</Link>}
              {(movie.status === "ready" || movie.status === "failed") && <Button onClick={() => void retry(movie.id)}>Обработать снова</Button>}
              <Button variant="danger" disabled={movie.status === "processing"} onClick={() => void remove(movie.id)}>Удалить</Button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function MovieStatusBadge({ status }: { status: MovieStatus }) {
  const labels: Record<MovieStatus, string> = {
    queued: "В очереди",
    processing: "Обработка",
    ready: "Готов",
    failed: "Ошибка",
  };
  const colors: Record<MovieStatus, string> = {
    queued: "bg-amber-50 text-amber-700",
    processing: "bg-blue-50 text-blue-700",
    ready: "bg-emerald-50 text-emerald-700",
    failed: "bg-red-50 text-red-700",
  };
  return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${colors[status]}`}>{labels[status]}</span>;
}
