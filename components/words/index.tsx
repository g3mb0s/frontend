"use client";

import { cn } from "@/lib/utils/cn";
import { CategoryPicker } from "./category-picker";
import { StatsPanel } from "./stats-panel";
import { useWordStudy, type StudyMode } from "./use-word-study";
import { WordCard } from "./word-card";

const TABS: Array<{ mode: StudyMode; label: string }> = [
  { mode: "new", label: "Новые" },
  { mode: "review", label: "Повторение" },
];

export function WordStudy() {
  const study = useWordStudy();

  if (study.preferencesLoading) {
    return <p className="mt-10 text-sm text-slate-500">Загружаем настройки…</p>;
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[20rem_minmax(0,1fr)]">
      <aside className="space-y-6">
        <CategoryPicker
          key={study.categorySlugs.join(",")}
          categories={study.categories}
          selectedSlugs={study.categorySlugs}
          saving={study.savingPreferences}
          onSave={(slugs) => void study.saveSelectedCategories(slugs)}
        />
        <StatsPanel stats={study.stats} />
      </aside>

      <section className="min-w-0">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="inline-flex rounded-full border border-slate-200 bg-white p-1 shadow-sm">
            {TABS.map((tab) => (
              <button
                key={tab.mode}
                type="button"
                onClick={() => study.switchMode(tab.mode)}
                className={cn(
                  "rounded-full px-5 py-2 text-sm font-medium transition",
                  study.mode === tab.mode ? "bg-slate-950 text-white" : "text-slate-600 hover:text-slate-950",
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
          {study.current && (
            <p className="text-sm text-slate-500">
              {study.index + 1} из {study.items.length}
            </p>
          )}
        </div>

        {study.loading && (
          <p className="mt-10 rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
            Загружаем слова…
          </p>
        )}

        {!study.loading && study.error && (
          <p className="mt-10 rounded-2xl bg-red-50 p-4 text-sm text-red-700">{study.error}</p>
        )}

        {!study.loading && !study.error && study.categorySlugs.length === 0 && (
          <p className="mt-10 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
            Выберите категории слева, чтобы начать учить слова.
          </p>
        )}

        {!study.loading && !study.error && study.categorySlugs.length > 0 && !study.current && (
          <p className="mt-10 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
            {study.mode === "new"
              ? "Новых слов нет. Выберите другие категории или дождитесь синхронизации."
              : "Слов на повторение пока нет. Возвращайтесь позже или посмотрите новые слова."}
          </p>
        )}

        {!study.loading && !study.error && study.current && (
          <WordCard
            word={study.current}
            reveal={study.reveal}
            onRevealExamples={study.revealExamples}
            onRevealTranslation={study.revealTranslation}
            onStart={study.startCurrent}
            onKnown={study.markKnownCurrent}
            onAnswer={study.answerCurrent}
          />
        )}
      </section>
    </div>
  );
}
