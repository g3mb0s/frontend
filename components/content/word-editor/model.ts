import type { WordInput } from "@/lib/content/types";
import { categoryLabel } from "@/components/words/model";

export function emptyWord(): WordInput {
  return {
    word: "",
    translation: "",
    examples: [],
    transcription: "",
    status: "draft",
    tags: [],
    categories: [],
  };
}

export { categoryLabel as wordCategoryLabel };
