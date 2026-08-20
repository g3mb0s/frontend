"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createWord, getManagedWord, listWordCategories, updateWord as updateWordRequest } from "@/lib/content/api";
import type { WordCategory, WordInput } from "@/lib/content/types";
import { splitList } from "@/lib/utils/collections";
import { emptyWord } from "./model";

export function useWordEditor(wordId?: string) {
  const router = useRouter();
  const [word, setWord] = useState<WordInput>(() => emptyWord());
  const [categories, setCategories] = useState<WordCategory[]>([]);
  const [newCategorySlugs, setNewCategorySlugs] = useState("");
  const [loading, setLoading] = useState(Boolean(wordId));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    void listWordCategories().then(setCategories).catch((error: Error) => setMessage(error.message));
  }, []);

  useEffect(() => {
    if (!wordId) return;
    void getManagedWord(wordId)
      .then((value) => {
        setWord({
          word: value.word,
          translation: value.translation,
          examples: value.examples,
          transcription: value.transcription ?? "",
          status: value.status,
          tags: value.tags,
          categories: value.categories.map((category) => category.slug),
        });
      })
      .catch((error: Error) => setMessage(error.message))
      .finally(() => setLoading(false));
  }, [wordId]);

  function updateWord(patch: Partial<WordInput>) {
    setWord((current) => ({ ...current, ...patch }));
  }

  function updateExample(index: number, example: WordInput["examples"][number]) {
    setWord((current) => ({
      ...current,
      examples: current.examples.map((item, itemIndex) => itemIndex === index ? example : item),
    }));
  }

  function addExample() {
    setWord((current) => ({ ...current, examples: [...current.examples, {}] }));
  }

  function removeExample(index: number) {
    setWord((current) => ({ ...current, examples: current.examples.filter((_, itemIndex) => itemIndex !== index) }));
  }

  function toggleCategory(slug: string, checked: boolean) {
    setWord((current) => ({
      ...current,
      categories: checked ? [...current.categories, slug] : current.categories.filter((item) => item !== slug),
    }));
  }

  async function save() {
    setSaving(true);
    setMessage(null);
    const input = {
      ...word,
      categories: [...word.categories, ...splitList(newCategorySlugs)],
    };
    try {
      const saved = wordId ? await updateWordRequest(wordId, input) : await createWord(input);
      if (wordId) setMessage("Изменения сохранены");
      else router.replace(`/admin/words/${saved.id}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Не удалось сохранить слово");
    } finally {
      setSaving(false);
    }
  }

  return {
    word,
    categories,
    newCategorySlugs,
    loading,
    saving,
    message,
    setNewCategorySlugs,
    updateWord,
    updateExample,
    addExample,
    removeExample,
    toggleCategory,
    save,
  };
}
