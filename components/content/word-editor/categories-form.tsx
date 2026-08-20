import type { WordCategory, WordInput } from "@/lib/content/types";
import { Card } from "@/components/ui/card";
import { Checkbox, Input } from "@/components/ui/form-controls";
import { wordCategoryLabel } from "./model";

interface CategoriesFormProps {
  word: WordInput;
  categories: WordCategory[];
  newCategorySlugs: string;
  onToggleCategory: (slug: string, checked: boolean) => void;
  onNewCategorySlugsChange: (value: string) => void;
}

export function CategoriesForm({ word, categories, newCategorySlugs, onToggleCategory, onNewCategorySlugsChange }: CategoriesFormProps) {
  return (
    <Card>
      <h2 className="text-xl font-semibold">Категории</h2>
      <p className="mt-2 text-sm text-slate-500">Неизвестные категории создаются автоматически при сохранении.</p>
      <div className="mt-6 grid gap-2 sm:grid-cols-2">
        {categories.map((category) => (
          <Checkbox
            key={category.slug}
            label={`${wordCategoryLabel(category)} (${category.word_count})`}
            checked={word.categories.includes(category.slug)}
            onChange={(checked) => onToggleCategory(category.slug, checked)}
          />
        ))}
      </div>
      <div className="mt-6">
        <p className="mb-2 block text-sm font-medium text-slate-700">Новые категории через запятую</p>
        <Input
          value={newCategorySlugs}
          onChange={(event) => onNewCategorySlugsChange(event.target.value)}
          placeholder="phrasal_verbs, idioms"
        />
      </div>
    </Card>
  );
}
