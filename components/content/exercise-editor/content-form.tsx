import type { ExerciseType } from "@/lib/content/types";
import { FillGapForm } from "./fill-gap-form";
import { MatchingForm } from "./matching-form";
import { SentenceForm } from "./sentence-form";

export type ExerciseItemsFormProps = {
  items: Record<string, unknown>[];
  setItems: (items: Record<string, unknown>[]) => void;
};

export function ExerciseContentForm({ type, content, onChange }: { type: ExerciseType; content: Record<string, unknown>; onChange: (content: Record<string, unknown>) => void }) {
  const items = Array.isArray(content.items) ? content.items as Record<string, unknown>[] : [];
  const setItems = (next: Record<string, unknown>[]) => onChange({ ...content, items: next });

  if (type === "fill_gap_choice" || type === "fill_gap_input") return <FillGapForm type={type} items={items} setItems={setItems} />;
  if (type === "matching") return <MatchingForm items={items} setItems={setItems} />;
  return <SentenceForm type={type} items={items} setItems={setItems} />;
}
