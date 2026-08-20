"use client";

import { useState } from "react";
import type { SrsCategory } from "@/lib/srs/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/form-controls";
import { categoryLabel } from "./model";

interface CategoryPickerProps {
  categories: SrsCategory[];
  selectedSlugs: string[];
  saving: boolean;
  onSave: (categorySlugs: string[]) => void;
}

export function CategoryPicker({ categories, selectedSlugs, saving, onSave }: CategoryPickerProps) {
  const [selected, setSelected] = useState<string[]>(selectedSlugs);

  function toggle(slug: string, checked: boolean) {
    setSelected((current) => (checked ? [...current, slug] : current.filter((item) => item !== slug)));
  }

  const unchanged = selected.length === selectedSlugs.length && selected.every((slug) => selectedSlugs.includes(slug));

  return (
    <Card className="p-5">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Категории для изучения</h2>
      <p className="mt-2 text-xs leading-relaxed text-slate-500">
        Новые слова берутся из выбранных категорий. Повторение включает все категории.
      </p>
      <div className="mt-4 space-y-2">
        {categories.map((category) => (
          <Checkbox
            key={category.slug}
            label={`${categoryLabel(category)} (${category.word_count})`}
            checked={selected.includes(category.slug)}
            onChange={(checked) => toggle(category.slug, checked)}
          />
        ))}
      </div>
      {categories.length === 0 && (
        <p className="mt-4 rounded-xl bg-slate-50 p-3 text-xs text-slate-500">
          Категории пока не синхронизированы. Импортируйте слова и дождитесь загрузки.
        </p>
      )}
      <div className="mt-5">
        <Button variant="primary" className="w-full" disabled={saving || selected.length === 0 || unchanged} onClick={() => onSave(selected)}>
          {saving ? "Сохраняем…" : "Сохранить"}
        </Button>
      </div>
    </Card>
  );
}
