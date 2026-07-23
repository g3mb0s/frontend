"use client";

import { useState, type KeyboardEvent } from "react";
import { SendIcon } from "./chat-icons";

interface ChatComposerProps {
  isSending: boolean;
  onSend: (message: string) => Promise<boolean>;
}

export function ChatComposer({ isSending, onSend }: ChatComposerProps) {
  const [value, setValue] = useState("");

  async function submit() {
    const content = value.trim();
    if (!content || isSending) return;
    setValue("");
    const sent = await onSend(content);
    if (!sent) setValue(content);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void submit();
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-4 sm:px-6">
      <div className="relative rounded-3xl border border-slate-300 bg-white p-2 shadow-[0_12px_40px_rgba(15,23,42,0.12)] transition focus-within:border-indigo-400 focus-within:ring-4 focus-within:ring-indigo-100">
        <textarea
          className="block max-h-40 min-h-14 w-full resize-none bg-transparent px-3 py-3 pr-14 text-[15px] leading-6 text-slate-900 outline-none placeholder:text-slate-400"
          value={value}
          rows={1}
          maxLength={20000}
          placeholder="Спросите что-нибудь об английском…"
          aria-label="Сообщение"
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          className="absolute bottom-3 right-3 grid size-10 place-items-center rounded-full bg-slate-950 text-white transition hover:bg-indigo-600 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
          disabled={!value.trim() || isSending}
          aria-label="Отправить сообщение"
          onClick={() => void submit()}
        >
          <SendIcon className="size-5" />
        </button>
      </div>
      <p className="mt-2 text-center text-[11px] text-slate-400">Enter — отправить, Shift + Enter — новая строка</p>
    </div>
  );
}
