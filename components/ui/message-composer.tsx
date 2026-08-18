"use client";

import {
  useCallback,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils/cn";

const LINE_HEIGHT = 24;
const MAX_LINES = 5;

interface MessageComposerProps {
  isSending: boolean;
  onSend: (message: string) => Promise<boolean>;
  placeholder?: string;
  ariaLabel?: string;
  maxLength?: number;
  hint?: string;
  accent?: "indigo" | "sky";
  sendIcon?: ReactNode;
}

export function MessageComposer({
  isSending,
  onSend,
  placeholder = "Сообщение…",
  ariaLabel = "Сообщение",
  maxLength = 20000,
  hint,
  accent = "indigo",
  sendIcon,
}: MessageComposerProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const resize = useCallback(() => {
    const element = textareaRef.current;
    if (!element) return;
    element.style.height = "auto";
    const lines = Math.max(1, Math.floor(element.scrollHeight / LINE_HEIGHT));
    const height = Math.min(lines, MAX_LINES) * LINE_HEIGHT;
    element.style.height = `${height}px`;
    element.style.overflowY = element.scrollHeight > height ? "auto" : "hidden";
  }, []);

  async function submit() {
    const content = value.trim();
    if (!content || isSending) return;
    setValue("");
    if (textareaRef.current) textareaRef.current.style.height = `${LINE_HEIGHT}px`;
    const sent = await onSend(content);
    if (!sent) {
      setValue(content);
      if (textareaRef.current) {
        textareaRef.current.value = content;
        resize();
      }
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void submit();
    }
  }

  return (
    <>
      <div
        className={cn(
          "relative rounded-2xl border border-slate-300 bg-white p-2 shadow-[0_12px_40px_rgba(15,23,42,0.12)] focus-within:ring-4",
          accent === "indigo"
            ? "focus-within:border-indigo-400 focus-within:ring-indigo-100"
            : "focus-within:border-sky-400 focus-within:ring-sky-100",
        )}
      >
        <textarea
          ref={textareaRef}
          className="block w-full resize-none overflow-hidden bg-transparent py-0 pr-12 text-[15px] leading-6 outline-none placeholder:text-slate-400"
          style={{ height: LINE_HEIGHT }}
          rows={1}
          maxLength={maxLength}
          value={value}
          placeholder={placeholder}
          aria-label={ariaLabel}
          onChange={(event) => {
            setValue(event.target.value);
            resize();
          }}
          onKeyDown={handleKeyDown}
        />
        <button
          className={cn(
            "absolute right-2 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-full text-white transition disabled:bg-slate-200 disabled:text-slate-400",
            accent === "indigo"
              ? "bg-slate-950 hover:bg-indigo-600"
              : "bg-sky-600 hover:bg-sky-700",
          )}
          disabled={isSending || !value.trim()}
          aria-label="Отправить сообщение"
          onClick={() => void submit()}
        >
          {sendIcon ?? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4" aria-hidden="true">
              <path d="m5 12 7-7 7 7M12 19V5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>
      </div>
      {hint && <p className="mt-2 text-center text-[11px] text-slate-400">{hint}</p>}
    </>
  );
}
