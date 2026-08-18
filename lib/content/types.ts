export type ContentStatus = "draft" | "published" | "archived";
export type CourseEntryType = "article" | "exercise";

export interface CourseEntryContent {
  id: string;
  title: string | null;
  type?: string;
  status: ContentStatus;
  blocks?: ArticleBlock[];
  tags?: string[];
  level?: string | null;
  payload?: ExerciseInput & { id: string };
}

export interface CourseEntry {
  id: string;
  position: number;
  type: CourseEntryType;
  content_id: string;
  content: CourseEntryContent | null;
}

export interface CourseUnit {
  id: string;
  title: string;
  description: string;
  position: number;
  entries: CourseEntry[];
}

export interface CourseSection {
  id: string;
  title: string;
  description: string;
  position: number;
  units: CourseUnit[];
}

export interface Course {
  id: string;
  slug: string;
  title: string;
  description: string;
  level: string | null;
  status: ContentStatus;
  sections: CourseSection[];
  sections_count: number;
  units_count: number;
  entries_count: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CourseEntryInput {
  type: CourseEntryType;
  contentId: string;
}

export interface CourseUnitInput {
  title: string;
  description: string;
  entries: CourseEntryInput[];
}

export interface CourseSectionInput {
  title: string;
  description: string;
  units: CourseUnitInput[];
}

export interface CourseInput {
  slug: string;
  title: string;
  description: string;
  level?: string;
  status: ContentStatus;
  sections: CourseSectionInput[];
}

export interface ContentOption {
  id: string;
  kind: CourseEntryType;
  title: string;
  status: ContentStatus;
  subtype?: string;
}

export interface ArticleBlock {
  type: "text" | "image" | "audio" | "video" | "callout" | "exercise_link";
  title?: string;
  text?: string;
  url?: string;
  style?: string;
  exerciseId?: string;
}

export interface Article {
  id: string;
  title: string;
  blocks: ArticleBlock[];
  exercise_ids: string[];
  status: ContentStatus;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface ArticleInput {
  title: string;
  blocks: ArticleBlock[];
  exerciseIds: string[];
  status: ContentStatus;
  tags: string[];
}

export type ExerciseType = "fill_gap_choice" | "matching" | "fill_gap_input" | "sentence_from_audio" | "sentence_from_translation";

export interface Exercise {
  id: string;
  type: ExerciseType;
  title: string | null;
  level: string | null;
  language: string | null;
  status: ContentStatus;
  tags: string[];
  payload: ExerciseInput & { id: string };
  created_at: string;
  updated_at: string;
}

export interface ExerciseInput {
  type: ExerciseType;
  title: string;
  level: string;
  language: string;
  tags: string[];
  content: Record<string, unknown>;
  settings: Record<string, unknown>;
  scoring: Record<string, unknown>;
  metadata: { version: number; status: ContentStatus };
}

export type MovieStatus = "queued" | "processing" | "ready" | "failed";

export interface MovieClip {
  id: string;
  position: number;
  start_ms: number;
  end_ms: number;
}

export interface Movie {
  id: string;
  title: string;
  status: MovieStatus;
  duration_ms: number | null;
  hls_url: string | null;
  thumbnail_url: string | null;
  subtitles: {
    ru_url: string | null;
    en_url: string | null;
  };
  clips: MovieClip[];
  error_message?: string | null;
  processing_logs?: MovieProcessingLog[];
  created_at: string;
  updated_at: string;
}

export interface MovieProcessingLog {
  id: string;
  processing_event_id: string;
  level: "info" | "error";
  stage: string;
  message: string;
  created_at: string;
}

export interface MoviePage {
  items: Movie[];
  pagination: {
    page: number;
    page_size: number;
    total: number;
    total_pages: number;
  };
}
