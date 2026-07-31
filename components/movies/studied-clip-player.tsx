"use client";

import { useMemo, useRef, useState } from "react";
import { VideoPlayer, type VideoPlayerElement } from "@/components/ui/video-player";
import type { Movie } from "@/lib/content/types";
import type { StudiedClip } from "@/lib/progress/types";

export function StudiedClipPlayer({ movie, clip }: { movie: Movie; clip: StudiedClip }) {
  const playerRef = useRef<VideoPlayerElement>(null);
  const [error, setError] = useState<string | null>(null);
  const clipRange = useMemo(
    () => ({ start: clip.start_ms / 1000, end: clip.end_ms / 1000 }),
    [clip.end_ms, clip.start_ms],
  );

  return (
    <div>
      <VideoPlayer
        src={movie.hls_url}
        title={`${movie.title} — клип ${clip.position + 1}`}
        playerRef={playerRef}
        russianSubtitles={movie.subtitles.ru_url}
        englishSubtitles={movie.subtitles.en_url}
        clipRange={clipRange}
        onError={setError}
      />

      {error && <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    </div>
  );
}
