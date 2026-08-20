export type PromptLanguage = "en" | "ru";

/**
 * Even review counts prompt in English (front of the card is the word),
 * odd review counts prompt in Russian (front of the card is the translation).
 */
export function promptLanguage(reviewCount: number): PromptLanguage {
  return reviewCount % 2 === 0 ? "en" : "ru";
}

export function categoryLabel(category: { slug: string; name_ru: string | null; name_en: string | null }): string {
  return category.name_ru || category.name_en || category.slug;
}

export interface MarkedSegment {
  text: string;
  highlighted: boolean;
}

/** Splits example text on #markers#, producing segments rendered as <strong>. */
export function splitMarkedText(text: string): MarkedSegment[] {
  return text.split(/#([^#]+)#/g).map((part, index) => ({
    text: part,
    highlighted: index % 2 === 1,
  }));
}
