"use client";

import { useState, type KeyboardEvent } from "react";

export function CharacterComposer({
  sending,
  onSend,
}: {
  sending: boolean;
  onSend: (content: string) => Promise<boolean>;
}) {
  const [value, setValue] = useState("");

  async function submit() {
    const content = value.trim();
    if (!content || sending) return;
    setValue("");
    if (!(await onSend(content))) setValue(content);
  }

  function keyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void submit();
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 pb-4 sm:px-6">
      <div className="relative rounded-2xl border border-slate-300 bg-white p-2 shadow-[0_10px_35px_rgba(15,23,42,0.12)] focus-within:border-sky-400 focus-within:ring-4 focus-within:ring-sky-100">
        <textarea
          className="block max-h-32 min-h-12 w-full resize-none bg-transparent px-3 py-2 pr-12 text-sm leading-6 outline-none placeholder:text-slate-400"
          rows={1}
          maxLength={2000}
          value={value}
          placeholder="Write a message in English…"
          aria-label="Message in English"
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={keyDown}
        />
        <button
          className="absolute bottom-2.5 right-2.5 grid size-9 place-items-center rounded-full bg-sky-600 text-white transition hover:bg-sky-700 disabled:bg-slate-200 disabled:text-slate-400"
          disabled={sending || !value.trim()}
          aria-label="Send message"
          onClick={() => void submit()}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4" aria-hidden="true">
            <path d="m5 12 7-7 7 7M12 19V5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
      <p className="mt-2 text-center text-[11px] text-slate-400">English only · Your message will receive a score</p>
    </div>
  );
}
