"use client";

import { useEffect, useState } from "react";
import { getMovie } from "@/lib/content/api";
import type { Movie } from "@/lib/content/types";
import { getStudiedClip } from "@/lib/progress/api";
import type { StudiedClip } from "@/lib/progress/types";
import { StudiedClipPlayer } from "./studied-clip-player";

export function StudiedClipView({ clipId }: { clipId: string }) {
  const [clip, setClip] = useState<StudiedClip | null>(null);
  const [movie, setMovie] = useState<Movie | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void getStudiedClip(clipId)
      .then(async (nextClip) => {
        const nextMovie = await getMovie(nextClip.movie.id);
        if (!active) return;
        setClip(nextClip);
        setMovie(nextMovie);
      })
      .catch((reason: unknown) => {
        if (active) setError(reason instanceof Error ? reason.message : "Не удалось загрузить клип.");
      });
    return () => {
      active = false;
    };
  }, [clipId]);

  if (error) return <p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>;
  if (!clip || !movie) return <p className="text-sm text-slate-500">Загружаем клип…</p>;

  return (
    <>
      <h1 className="mb-2 text-3xl font-bold tracking-tight">{movie.title}</h1>
      <p className="mb-6 text-sm text-slate-500">
        Клип {clip.position + 1} · длительность {formatDuration(clip.end_ms - clip.start_ms)}
      </p>
      <StudiedClipPlayer movie={movie} clip={clip} />
    </>
  );
}

function formatDuration(milliseconds: number) {
  const totalSeconds = Math.max(0, Math.round(milliseconds / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
