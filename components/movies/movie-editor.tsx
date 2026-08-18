"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/form-controls";
import { deleteMovie, getManagedMovie, reprocessMovie, updateMovie } from "@/lib/content/api";
import type { Movie, MovieProcessingLog } from "@/lib/content/types";

export function MovieEditor({ movieId }: { movieId: string }) {
  const router = useRouter();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [title, setTitle] = useState("");
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const titleInitialized = useRef(false);

  const load = useCallback(async () => {
    try {
      const loaded = await getManagedMovie(movieId);
      setMovie(loaded);
      if (!titleInitialized.current) {
        setTitle(loaded.title);
        titleInitialized.current = true;
      }
      setMessage(null);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Не удалось загрузить фильм");
    } finally {
      setLoading(false);
    }
  }, [movieId]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  useEffect(() => {
    if (!movie || (movie.status !== "queued" && movie.status !== "processing")) return;
    const timer = window.setInterval(() => void load(), 3000);
    return () => window.clearInterval(timer);
  }, [load, movie]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!movie) return;
    setSaving(true);
    setMessage(null);
    const formData = new FormData();
    formData.set("title", title);
    if (thumbnail) formData.set("thumbnail", thumbnail);
    try {
      const updated = await updateMovie(movie.id, formData);
      setMovie({ ...updated, processing_logs: movie.processing_logs });
      setThumbnail(null);
      setMessage("Изменения сохранены");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Не удалось сохранить фильм");
    } finally {
      setSaving(false);
    }
  }

  async function retry() {
    if (!movie) return;
    try {
      await reprocessMovie(movie.id);
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Не удалось запустить обработку");
    }
  }

  async function remove() {
    if (!movie || !window.confirm("Удалить фильм и все его файлы?")) return;
    try {
      await deleteMovie(movie.id);
      router.push("/admin/movies");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Не удалось удалить фильм");
    }
  }

  if (loading) return <p className="text-sm text-slate-500">Загружаем фильм…</p>;
  if (!movie) return <p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{message ?? "Фильм не найден"}</p>;

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.8fr)]">
      <div className="space-y-6">
        <form onSubmit={submit} className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-semibold">Данные фильма</h2>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{statusLabel(movie.status)}</span>
          </div>
          <Field label="Название">
            <Input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={200} required disabled={saving} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-[128px_1fr] sm:items-end">
            <div className="aspect-[2/3] overflow-hidden rounded-xl bg-slate-100">
              {movie.thumbnail_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={movie.thumbnail_url} alt={`Постер ${movie.title}`} className="h-full w-full object-cover" />
              ) : <div className="flex h-full items-center justify-center text-xs text-slate-400">Нет постера</div>}
            </div>
            <Field label="Новый постер (необязательно)">
              <Input type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={(event) => setThumbnail(event.target.files?.[0] ?? null)} disabled={saving} />
            </Field>
          </div>
          {message && <p className="rounded-xl bg-slate-50 p-3 text-sm text-slate-700">{message}</p>}
          <div className="flex flex-wrap gap-2">
            <Button type="submit" variant="primary" disabled={saving}>{saving ? "Сохраняем…" : "Сохранить"}</Button>
            {movie.status === "ready" && <Link href={`/movies/${movie.id}`} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium hover:bg-slate-50">Смотреть</Link>}
            {(movie.status === "ready" || movie.status === "failed") && <Button onClick={() => void retry()}>Обработать снова</Button>}
            <Button variant="danger" onClick={() => void remove()}>Удалить</Button>
          </div>
        </form>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Техническая информация</h2>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <Info label="ID" value={movie.id} />
            <Info label="Длительность" value={movie.duration_ms ? `${Math.round(movie.duration_ms / 1000)} сек.` : "—"} />
            <Info label="Клипы" value={String(movie.clips.length)} />
            <Info label="Обновлён" value={formatDate(movie.updated_at)} />
          </dl>
        </div>
      </div>
      <ProcessingLogs logs={movie.processing_logs ?? []} />
    </div>
  );
}

function ProcessingLogs({ logs }: { logs: MovieProcessingLog[] }) {
  const ffmpegLogs = logs.filter((entry) => entry.stage === "ffmpeg").reverse();
  return (
    <section className="self-start rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold">Вывод FFmpeg</h2>
      <p className="mt-1 text-sm text-slate-500">Фактический stderr FFmpeg обновляется во время транскодирования.</p>
      {!ffmpegLogs.length ? <p className="mt-6 text-sm text-slate-500">FFmpeg ещё не запускался или не успел вывести данные.</p> : (
        <div className="mt-6 max-h-[70vh] overflow-auto rounded-xl bg-slate-950 p-4 text-slate-200">
          {ffmpegLogs.map((entry) => (
            <div key={entry.id}>
              <div className="mb-1 mt-3 font-mono text-[10px] text-slate-500 first:mt-0">{formatDate(entry.created_at)} · attempt {entry.processing_event_id.slice(0, 8)}</div>
              <pre className="whitespace-pre-wrap break-words font-mono text-xs leading-5">{entry.message}</pre>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return <div><dt className="text-slate-500">{label}</dt><dd className="mt-1 break-all font-medium text-slate-900">{value}</dd></div>;
}

function statusLabel(status: Movie["status"]) {
  return { queued: "В очереди", processing: "Обработка", ready: "Готов", failed: "Ошибка" }[status];
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ru-RU", { dateStyle: "short", timeStyle: "medium" }).format(new Date(value));
}
