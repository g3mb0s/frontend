"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createArticle, getManagedArticle, listManagedExercises, updateArticle as updateArticleRequest } from "@/lib/content/api";
import type { ArticleBlock, ArticleInput, Exercise } from "@/lib/content/types";
import { moveItem, splitList } from "@/lib/utils/collections";

const emptyArticle: ArticleInput = { title: "", blocks: [], exerciseIds: [], status: "draft", tags: [] };

export function useArticleEditor(articleId?: string) {
  const router = useRouter();
  const [article, setArticle] = useState<ArticleInput>(emptyArticle);
  const [tags, setTags] = useState("");
  const [loading, setLoading] = useState(Boolean(articleId));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [preview, setPreview] = useState(false);
  const [exercises, setExercises] = useState<Exercise[]>([]);

  useEffect(() => {
    void listManagedExercises().then(setExercises).catch((error: Error) => setMessage(error.message));
  }, []);

  useEffect(() => {
    if (!articleId) return;
    void getManagedArticle(articleId)
      .then((value) => {
        setArticle({ title: value.title, blocks: value.blocks, exerciseIds: value.exercise_ids, status: value.status, tags: value.tags });
        setTags(value.tags.join(", "));
      })
      .catch((error: Error) => setMessage(error.message))
      .finally(() => setLoading(false));
  }, [articleId]);

  async function save() {
    setSaving(true);
    setMessage(null);
    const input = {
      ...article,
      tags: splitList(tags),
      exerciseIds: article.blocks
        .filter((block) => block.type === "exercise_link" && block.exerciseId)
        .map((block) => block.exerciseId!),
    };

    try {
      const saved = articleId ? await updateArticleRequest(articleId, input) : await createArticle(input);
      if (articleId) setMessage("Изменения сохранены");
      else router.replace(`/admin/articles/${saved.id}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Не удалось сохранить статью");
    } finally {
      setSaving(false);
    }
  }

  function updateArticle(patch: Partial<ArticleInput>) {
    setArticle((current) => ({ ...current, ...patch }));
  }

  function updateBlock(index: number, block: ArticleBlock) {
    setArticle((current) => ({ ...current, blocks: current.blocks.map((item, itemIndex) => itemIndex === index ? block : item) }));
  }

  function addBlock() {
    setArticle((current) => ({ ...current, blocks: [...current.blocks, { type: "text", text: "" }] }));
  }

  function removeBlock(index: number) {
    setArticle((current) => ({ ...current, blocks: current.blocks.filter((_, itemIndex) => itemIndex !== index) }));
  }

  function moveBlock(index: number, direction: -1 | 1) {
    setArticle((current) => ({ ...current, blocks: moveItem(current.blocks, index, direction) }));
  }

  return { article, tags, loading, saving, message, preview, exercises, setTags, setPreview, updateArticle, updateBlock, addBlock, removeBlock, moveBlock, save };
}
