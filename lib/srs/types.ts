export interface WordExample {
  en?: string;
  ru?: string;
}

export type SrsCardStatus = "new" | "learning" | "learned" | "known";

export interface SrsCardState {
  id?: string;
  status: SrsCardStatus;
  stage: number;
  review_count: number;
  error_count: number;
  last_answer_wrong: boolean;
  next_review_at: string | null;
  last_reviewed_at?: string | null;
  started_at?: string;
  updated_at?: string;
}

export interface SrsWord {
  id: string;
  word: string;
  translation: string;
  transcription: string | null;
  examples: WordExample[];
  categories: string[];
  card: SrsCardState;
}

export interface SrsCategory {
  slug: string;
  name_ru: string | null;
  name_en: string | null;
  word_count: number;
}

export interface SrsPreferences {
  category_slugs: string[];
}

export interface SrsStats {
  new: number;
  learning: number;
  learned: number;
  known: number;
  with_errors: number;
}

export type SrsWordStatus =
  | "new"
  | "learning"
  | "single_review"
  | "recent"
  | "due"
  | "learned"
  | "long_learned"
  | "known";

export interface WordListResult {
  items: SrsWord[];
  total: number;
  offset: number;
  limit: number;
}
