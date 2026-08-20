"use client";

import { useCallback, useEffect, useState } from "react";
import {
  answerWord,
  getDueWords,
  getNewWords,
  getPreferences,
  getWordStats,
  listSrsCategories,
  markWordKnown,
  savePreferences,
  startWord,
} from "@/lib/srs/api";
import type { SrsCategory, SrsStats, SrsWord } from "@/lib/srs/types";

export type StudyMode = "new" | "review";

export interface RevealState {
  examples: boolean;
  translation: boolean;
}

const EMPTY_STATS: SrsStats = { new: 0, learning: 0, learned: 0, known: 0, with_errors: 0 };

export function useWordStudy() {
  const [preferencesLoading, setPreferencesLoading] = useState(true);
  const [categorySlugs, setCategorySlugs] = useState<string[]>([]);
  const [categories, setCategories] = useState<SrsCategory[]>([]);
  const [stats, setStats] = useState<SrsStats>(EMPTY_STATS);
  const [mode, setMode] = useState<StudyMode>("new");
  const [items, setItems] = useState<SrsWord[]>([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savingPreferences, setSavingPreferences] = useState(false);
  const [reveal, setReveal] = useState<RevealState>({ examples: false, translation: false });

  const loadStats = useCallback(async () => {
    try {
      setStats(await getWordStats());
    } catch {
      // Statistics are supplementary; a failure should not block studying.
    }
  }, []);

  useEffect(() => {
    let active = true;
    void getPreferences()
      .then((slugs) => {
        if (!active) return;
        setCategorySlugs(slugs);
        setPreferencesLoading(false);
      })
      .catch((error: Error) => {
        if (!active) return;
        setError(error.message);
        setPreferencesLoading(false);
      });
    void listSrsCategories()
      .then((items) => {
        if (active) setCategories(items);
      })
      .catch(() => {
        // Category list is a convenience; preferences loading remains the gate.
      });
    void getWordStats()
      .then((nextStats) => {
        if (active) setStats(nextStats);
      })
      .catch(() => {
        // Statistics are supplementary; a failure should not block studying.
      });
    return () => {
      active = false;
    };
  }, []);

  const current = items[index] ?? null;

  const loadQueue = useCallback(async (nextMode: StudyMode) => {
    setLoading(true);
    setError(null);
    setReveal({ examples: false, translation: false });
    try {
      const next = nextMode === "new" ? await getNewWords(10) : await getDueWords(10);
      setItems(next);
      setIndex(0);
      setMode(nextMode);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Не удалось загрузить слова");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    void getNewWords(10)
      .then((next) => {
        if (!active) return;
        setItems(next);
        setIndex(0);
      })
      .catch((error) => {
        if (!active) return;
        setError(error instanceof Error ? error.message : "Не удалось загрузить слова");
      });
    return () => {
      active = false;
    };
  }, []);

  function switchMode(nextMode: StudyMode) {
    if (nextMode === mode) return;
    void loadQueue(nextMode);
  }

  async function runAction(action: () => Promise<unknown>) {
    if (!current) return;
    setError(null);
    try {
      await action();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Не удалось выполнить действие");
      return;
    }
    setReveal({ examples: false, translation: false });
    void loadQueue(mode);
    void loadStats();
  }

  function startCurrent() {
    if (!current) return;
    void runAction(() => startWord(current.id));
  }

  function markKnownCurrent() {
    if (!current) return;
    void runAction(() => markWordKnown(current.id));
  }

  function answerCurrent(remembered: boolean) {
    if (!current) return;
    void runAction(() => answerWord(current.id, remembered));
  }

  function revealExamples() {
    setReveal((currentReveal) => ({ ...currentReveal, examples: true }));
  }

  function revealTranslation() {
    setReveal((currentReveal) => ({ ...currentReveal, translation: true }));
  }

  async function saveSelectedCategories(slugs: string[]) {
    setSavingPreferences(true);
    setError(null);
    try {
      const saved = await savePreferences(slugs);
      setCategorySlugs(saved);
      void loadStats();
      void loadQueue(mode);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Не удалось сохранить категории");
    } finally {
      setSavingPreferences(false);
    }
  }

  return {
    preferencesLoading,
    categorySlugs,
    categories,
    stats,
    mode,
    items,
    index,
    current,
    loading,
    error,
    reveal,
    savingPreferences,
    switchMode,
    startCurrent,
    markKnownCurrent,
    answerCurrent,
    revealExamples,
    revealTranslation,
    saveSelectedCategories,
  };
}
