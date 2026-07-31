"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { listStudiedClips } from "@/lib/progress/api";
import type { StudiedClip } from "@/lib/progress/types";

export function StudiedClips() {
  const [clips, setClips] = useState<StudiedClip[]>([]);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    let active = true;
    void listStudiedClips()
      .then((items) => {
        if (!active) return;
        setClips(items);
        setState("ready");
      })
      .catch(() => {
        if (active) setState("error");
      });
    return () => {
      active = false;
    };
  }, []);

  if (state === "loading") return <p className="mt-10 text-sm text-slate-500">Загружаем добавленные клипы…</p>;
  if (state === "error") return <p className="mt-10 rounded-xl bg-red-50 p-4 text-sm text-red-700">Не удалось загрузить клипы.</p>;
  if (!clips.length) {
    return (
      <p className="mt-10 rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
        Вы ещё не добавили ни одного клипа. Откройте фильм и нажмите плюс во время нужного фрагмента.
      </p>
    );
  }

  return (
    <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
      {clips.map((clip) => (
        <Link key={clip.id} href={`/clips/${clip.id}`} className="group min-w-0">
          <div className="aspect-[2/3] overflow-hidden rounded-xl bg-slate-200 shadow-sm ring-1 ring-slate-200 transition group-hover:-translate-y-1 group-hover:shadow-lg group-hover:ring-indigo-300">
            {clip.movie.thumbnail_url ? (
              // Object storage has a runtime-configured public origin, so next/image cannot whitelist it at build time.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={clip.movie.thumbnail_url}
                alt={`Постер фильма «${clip.movie.title}»`}
                loading="lazy"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-300 px-4 text-center text-sm font-medium text-slate-500">
                Нет постера
              </div>
            )}
          </div>
          <h2 className="mt-3 truncate font-semibold text-slate-950 group-hover:text-indigo-700">{clip.movie.title}</h2>
          <p className="mt-1 text-sm text-slate-500">Клип {clip.position + 1} · 0:00–{formatTime(clip.end_ms - clip.start_ms)}</p>
        </Link>
      ))}
    </div>
  );
}

function formatTime(milliseconds: number) {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
