"use client";

import type { SrsWord } from "@/lib/srs/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { ReactNode } from "react";
import { promptLanguage, splitMarkedText } from "./model";
import type { RevealState } from "./use-word-study";

interface WordCardProps {
  word: SrsWord;
  reveal: RevealState;
  onRevealExamples: () => void;
  onRevealTranslation: () => void;
  onStart: () => void;
  onKnown: () => void;
  onAnswer: (remembered: boolean) => void;
}

export function WordCard({ word, reveal, onRevealExamples, onRevealTranslation, onStart, onKnown, onAnswer }: WordCardProps) {
  const promptEn = promptLanguage(word.card.review_count) === "en";
  const front = promptEn ? word.word : word.translation;
  const back = promptEn ? word.translation : word.word;
  const isNew = word.card.status === "new";

  return (
    <Card className="mx-auto flex min-h-[30rem] w-full max-w-2xl flex-col">
      <div className="flex items-center justify-between gap-4">
        <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-600">
          {promptEn ? "EN → RU" : "RU → EN"}
        </span>
        <div className="flex flex-wrap justify-end gap-1">
          {word.categories.map((slug) => (
            <span key={slug} className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">{slug}</span>
          ))}
        </div>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center py-10">
        <h2 className="text-center text-5xl font-bold tracking-tight text-slate-950">{front}</h2>
        {word.transcription && !reveal.translation && (
          <p className="mt-3 text-sm text-slate-400">{word.transcription}</p>
        )}

        {reveal.translation && (
          <p className="mt-6 text-center text-2xl font-semibold text-slate-700">{back}</p>
        )}

        {reveal.examples && word.examples.length > 0 && (
          <div className="mt-10 w-full space-y-3">
            {word.examples.slice(0, 3).map((example, index) => (
              <div key={index} className="grid gap-3 sm:grid-cols-2">
                {example.en && (
                  <div className="rounded-xl bg-slate-50 px-4 py-3 text-slate-800">
                    <HighlightedText text={example.en} />
                  </div>
                )}
                {reveal.translation && example.ru && (
                  <div className="rounded-xl bg-slate-50 px-4 py-3 text-slate-500">
                    <HighlightedText text={example.ru} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-5">
        <button
          type="button"
          onClick={() => (isNew ? onKnown() : onAnswer(false))}
          className="inline-flex h-16 w-24 flex-col items-center justify-center gap-0.5 rounded-2xl border border-slate-200 bg-white text-sm font-semibold text-red-600 shadow-sm transition hover:border-red-300 hover:bg-red-50"
        >
          {isNew ? "Не знаю" : "Не помню"}
        </button>

        <div className="flex gap-2">
          <Button variant="ghost" onClick={onRevealExamples} disabled={reveal.examples} className="px-4">
            Примеры
          </Button>
          <Button variant="ghost" onClick={onRevealTranslation} disabled={reveal.translation} className="px-4">
            Перевод
          </Button>
        </div>

        <button
          type="button"
          onClick={() => (isNew ? onStart() : onAnswer(true))}
          className="inline-flex h-16 w-24 flex-col items-center justify-center gap-0.5 rounded-2xl border border-slate-200 bg-white text-sm font-semibold text-emerald-600 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-50"
        >
          {isNew ? "Знаю" : "Помню"}
        </button>
      </div>
    </Card>
  );
}

function HighlightedText({ text }: { text: string }) {
  const segments = splitMarkedText(text);
  const content: ReactNode[] = [];
  for (const segment of segments) {
    if (segment.highlighted) {
      content.push(<strong key={content.length} className="font-semibold text-indigo-700">{segment.text}</strong>);
    } else if (segment.text) {
      content.push(<span key={content.length}>{segment.text}</span>);
    }
  }
  return <>{content}</>;
}
