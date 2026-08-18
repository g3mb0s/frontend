"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { VideoPlayer, type VideoPlayerElement } from "@/components/ui/video-player";
import type { Movie } from "@/lib/content/types";
import { startStudyingClip } from "@/lib/progress/api";

export function MoviePlayer({ movie }: { movie: Movie }) {
  const playerRef = useRef<VideoPlayerElement>(null);
  const clipEndSecondsRef = useRef<number | null>(null);
  const addingClipRef = useRef(false);
  const movieRef = useRef(movie);
  useEffect(() => {
    movieRef.current = movie;
  }, [movie]);
  const [playerError, setPlayerError] = useState<string | null>(null);
  const [activeClip, setActiveClip] = useState<number | null>(null);
  const [studyMessage, setStudyMessage] = useState<string | null>(null);

  function playClip(position: number, startMs: number, endMs: number) {
    const player = playerRef.current;
    if (!player) return;
    clipEndSecondsRef.current = endMs / 1000;
    setActiveClip(position);
    player.currentTime = startMs / 1000;
    void player.play();
  }

  function playFullMovie() {
    clipEndSecondsRef.current = null;
    setActiveClip(null);
    void playerRef.current?.play();
  }

  const addClipAtCurrentTime = useCallback(async () => {
    const currentMovie = movieRef.current;
    const currentTimeMs = (playerRef.current?.currentTime ?? 0) * 1000;
    const clip = currentMovie.clips.find(
      ({ start_ms, end_ms }) => currentTimeMs >= start_ms && currentTimeMs < end_ms,
    );
    if (!clip || addingClipRef.current) return;
    addingClipRef.current = true;
    setStudyMessage(null);
    try {
      await startStudyingClip(currentMovie.id, clip.id);
      setStudyMessage(`Клип ${clip.position + 1} добавлен для повторения.`);
    } catch (error) {
      setStudyMessage(error instanceof Error ? error.message : "Не удалось добавить клип.");
    } finally {
      addingClipRef.current = false;
    }
  }, []);

  const enforceClipEnd = useCallback((player: VideoPlayerElement) => {
    const end = clipEndSecondsRef.current;
    if (end !== null && player.currentTime >= end) {
      void player.pause();
      player.currentTime = end;
      clipEndSecondsRef.current = null;
    }
  }, []);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
      <div>
        <VideoPlayer
          src={movie.hls_url}
          title={movie.title}
          playerRef={playerRef}
          russianSubtitles={movie.subtitles.ru_url}
          englishSubtitles={movie.subtitles.en_url}
          showAddClipButton
          onAddCurrentClip={addClipAtCurrentTime}
          onError={setPlayerError}
          onTimeUpdate={enforceClipEnd}
        />
        {playerError && <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">{playerError}</p>}
        {studyMessage && <p className="mt-3 rounded-lg bg-indigo-50 p-3 text-sm text-indigo-700">{studyMessage}</p>}
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
