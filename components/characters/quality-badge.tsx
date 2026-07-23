"use client";

import { useEffect, useRef, useState } from "react";

interface QualityBadgeProps {
  quality: number | null;
  correction: string | null;
  comment: string | null;
}

export function QualityBadge({
  quality,
  correction,
  comment,
}: QualityBadgeProps) {
  const [open, setOpen] = useState(false);
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent) => {
      if (!container.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  if (quality === null) {
    return (
      <span
        className="size-7 shrink-0 animate-pulse rounded-full bg-slate-200 ring-4 ring-white"
        aria-label="Your English is being evaluated"
      />
    );
  }

  const hue = quality * 12;
  const color = `hsl(${hue} 68% 42%)`;

  return (
    <div ref={container} className="relative shrink-0">
      <button
        className="grid size-7 place-items-center rounded-full text-[11px] font-black text-white shadow-sm ring-4 ring-white transition hover:scale-110 focus-visible:outline-none focus-visible:ring-indigo-300"
        style={{ backgroundColor: color }}
        aria-label={`English score ${quality} out of 10. Show feedback`}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        {quality}
      </button>
      {open && (
        <div className="absolute bottom-10 right-0 z-30 w-[min(19rem,calc(100vw-2rem))] rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-2xl">
          <div className="flex items-center justify-between gap-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">English score</span>
            <strong className="text-lg" style={{ color }}>{quality}/10</strong>
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full transition-all" style={{ width: `${quality * 10}%`, backgroundColor: color }} />
          </div>
          {correction && (
            <div className="mt-4">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Correct version</p>
              <p className="mt-1 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium leading-5 text-emerald-900">{correction}</p>
            </div>
          )}
          {comment ? (
            <div className="mt-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Grammar note</p>
              <p className="mt-1 text-sm leading-5 text-slate-600">{comment}</p>
            </div>
          ) : (
            <p className="mt-4 text-sm font-medium text-emerald-700">Perfect — no correction needed.</p>
          )}
        </div>
      )}
    </div>
  );
}
