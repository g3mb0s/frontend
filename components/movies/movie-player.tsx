"use client";

import Hls from "hls.js";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import type { Movie } from "@/lib/content/types";

export function MoviePlayer({ movie }: { movie: Movie }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const clipEndSeconds = useRef<number | null>(null);
  const [playerError, setPlayerError] = useState<string | null>(null);
  const [activeClip, setActiveClip] = useState<number | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !movie.hls_url) return;
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = movie.hls_url;
      return () => {
        video.removeAttribute("src");
        video.load();
      };
    }
    if (!Hls.isSupported()) {
      const timer = window.setTimeout(() => setPlayerError("Этот браузер не поддерживает HLS."), 0);
      return () => window.clearTimeout(timer);
    }
    const hls = new Hls();
    hls.loadSource(movie.hls_url);
    hls.attachMedia(video);
    hls.on(Hls.Events.ERROR, (_event, data) => {
      if (data.fatal) setPlayerError("Не удалось воспроизвести HLS-поток.");
    });
    return () => hls.destroy();
  }, [movie.hls_url]);

  function playClip(position: number, startMs: number, endMs: number) {
    const video = videoRef.current;
    if (!video) return;
    clipEndSeconds.current = endMs / 1000;
    setActiveClip(position);
    video.currentTime = startMs / 1000;
    void video.play();
  }

  function playFullMovie() {
    clipEndSeconds.current = null;
    setActiveClip(null);
    void videoRef.current?.play();
  }

  function enforceClipEnd() {
    const video = videoRef.current;
    const end = clipEndSeconds.current;
    if (video && end !== null && video.currentTime >= end) {
      video.pause();
      video.currentTime = end;
      clipEndSeconds.current = null;
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
      <div>
        <video
          ref={videoRef}
          controls
          crossOrigin="anonymous"
          preload="metadata"
          onTimeUpdate={enforceClipEnd}
          className="aspect-video w-full rounded-2xl bg-black shadow-lg"
        >
          {movie.subtitles.ru_url && <track kind="subtitles" src={movie.subtitles.ru_url} srcLang="ru" label="Русский" default />}
          {movie.subtitles.en_url && <track kind="subtitles" src={movie.subtitles.en_url} srcLang="en" label="English" />}
        </video>
        {playerError && <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">{playerError}</p>}
      </div>
      <aside className="max-h-[min(70vh,620px)] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-semibold">Клипы</h2>
          <Button size="sm" onClick={playFullMovie}>Весь фильм</Button>
        </div>
        <div className="mt-4 grid gap-2">
          {movie.clips.map((clip) => (
            <button
              type="button"
              key={clip.id}
              onClick={() => playClip(clip.position, clip.start_ms, clip.end_ms)}
              className={`rounded-lg border px-3 py-2 text-left text-sm transition ${
                activeClip === clip.position
                  ? "border-indigo-500 bg-indigo-50 text-indigo-800"
                  : "border-slate-200 hover:border-indigo-300 hover:bg-slate-50"
              }`}
            >
              <span className="font-medium">Клип {clip.position + 1}</span>
              <span className="ml-2 text-xs text-slate-500">{formatTime(clip.start_ms)}–{formatTime(clip.end_ms)}</span>
            </button>
          ))}
        </div>
      </aside>
    </div>
  );
}

function formatTime(milliseconds: number) {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
