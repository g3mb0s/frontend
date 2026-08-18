import { authFetch } from "@/lib/auth/auth-fetch";
import { getAccessToken } from "@/lib/auth/token-storage";
import type { Article, ArticleInput, ContentOption, ContentStatus, Course, CourseInput, Exercise, ExerciseInput, Movie, MoviePage } from "./types";

const CONTENT_API = "/api/content";

export async function listCourses(): Promise<Course[]> {
  const response = await fetch(`${CONTENT_API}/courses`);
  return readItems(response);
}

export async function getCourse(slug: string): Promise<Course> {
  const response = await fetch(`${CONTENT_API}/courses/${encodeURIComponent(slug)}`);
  return readCourse(response);
}

export async function listManagedCourses(): Promise<Course[]> {
  const response = await authFetch(`${CONTENT_API}/manage/courses`);
  return readItems(response);
}

export async function getManagedCourse(id: string): Promise<Course> {
  const response = await authFetch(`${CONTENT_API}/manage/courses/${id}`);
  return readCourse(response);
}

export async function createCourse(input: CourseInput): Promise<Course> {
  const response = await authFetch(`${CONTENT_API}/manage/courses`, jsonRequest("POST", input));
  return readCourse(response);
}

export async function updateCourse(id: string, input: CourseInput): Promise<Course> {
  const response = await authFetch(`${CONTENT_API}/manage/courses/${id}`, jsonRequest("PATCH", input));
  return readCourse(response);
}

export async function publishCourse(id: string): Promise<Course> {
  const response = await authFetch(`${CONTENT_API}/manage/courses/${id}/publish`, { method: "POST" });
  return readCourse(response);
}

export async function deleteCourse(id: string): Promise<void> {
  const response = await authFetch(`${CONTENT_API}/manage/courses/${id}`, { method: "DELETE" });
  await ensureOk(response);
}

export async function listManagedContent(search = ""): Promise<ContentOption[]> {
  const query = search ? `?search=${encodeURIComponent(search)}` : "";
  const [articlesResponse, exercisesResponse] = await Promise.all([
    authFetch(`${CONTENT_API}/manage/articles${query}`),
    authFetch(`${CONTENT_API}/manage/exercises${query}`),
  ]);
  await Promise.all([ensureOk(articlesResponse), ensureOk(exercisesResponse)]);
  const articles = (await articlesResponse.json()) as { items: ArticleListItem[] };
  const exercises = (await exercisesResponse.json()) as { items: ExerciseListItem[] };
  return [
    ...articles.items.map((item) => ({ id: item.id, kind: "article" as const, title: item.title, status: item.status })),
    ...exercises.items.map((item) => ({ id: item.id, kind: "exercise" as const, title: item.title ?? "Упражнение без названия", status: item.status, subtype: item.type })),
  ];
}

export async function listManagedArticles(search = ""): Promise<Article[]> {
  const response = await authFetch(`${CONTENT_API}/manage/articles${search ? `?search=${encodeURIComponent(search)}` : ""}`);
  return readEntityItems<Article>(response);
}

export async function getManagedArticle(id: string): Promise<Article> {
  const response = await authFetch(`${CONTENT_API}/manage/articles/${id}`);
  return readEntity<Article>(response, "article");
}

export async function createArticle(input: ArticleInput): Promise<Article> {
  const response = await authFetch(`${CONTENT_API}/articles`, jsonRequest("POST", input));
  return readEntity<Article>(response, "article");
}

export async function updateArticle(id: string, input: ArticleInput): Promise<Article> {
  const response = await authFetch(`${CONTENT_API}/articles/${id}`, jsonRequest("PATCH", input));
  return readEntity<Article>(response, "article");
}

export async function deleteArticle(id: string): Promise<void> {
  const response = await authFetch(`${CONTENT_API}/articles/${id}`, { method: "DELETE" });
  await ensureOk(response);
}

export async function listManagedExercises(search = ""): Promise<Exercise[]> {
  const response = await authFetch(`${CONTENT_API}/manage/exercises${search ? `?search=${encodeURIComponent(search)}` : ""}`);
  return readEntityItems<Exercise>(response);
}

export async function getManagedExercise(id: string): Promise<Exercise> {
  const response = await authFetch(`${CONTENT_API}/manage/exercises/${id}`);
  return readEntity<Exercise>(response, "exercise");
}

export async function createExercise(input: ExerciseInput): Promise<Exercise> {
  const response = await authFetch(`${CONTENT_API}/exercises`, jsonRequest("POST", input));
  return readEntity<Exercise>(response, "exercise");
}

export async function updateExercise(id: string, input: ExerciseInput): Promise<Exercise> {
  const response = await authFetch(`${CONTENT_API}/exercises/${id}`, jsonRequest("PATCH", input));
  return readEntity<Exercise>(response, "exercise");
}

export async function deleteExercise(id: string): Promise<void> {
  const response = await authFetch(`${CONTENT_API}/exercises/${id}`, { method: "DELETE" });
  await ensureOk(response);
}

export async function listMovies(
  { search = "", page = 1, pageSize = 12 }: { search?: string; page?: number; pageSize?: number } = {},
  signal?: AbortSignal,
): Promise<MoviePage> {
  const query = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });
  if (search) query.set("search", search);
  const response = await fetch(`${CONTENT_API}/movies?${query}`, { signal });
  await ensureOk(response);
  return (await response.json()) as MoviePage;
}

export async function getMovie(id: string): Promise<Movie> {
  return readEntity<Movie>(await fetch(`${CONTENT_API}/movies/${id}`), "movie");
}

export async function listManagedMovies(): Promise<Movie[]> {
  return readEntityItems<Movie>(await authFetch(`${CONTENT_API}/manage/movies`));
}

export async function getManagedMovie(id: string): Promise<Movie> {
  return readEntity<Movie>(await authFetch(`${CONTENT_API}/manage/movies/${id}`), "movie");
}

export async function updateMovie(id: string, formData: FormData): Promise<Movie> {
  return readEntity<Movie>(
    await authFetch(`${CONTENT_API}/manage/movies/${id}`, { method: "PATCH", body: formData }),
    "movie",
  );
}

export async function reprocessMovie(id: string): Promise<Movie> {
  return readEntity<Movie>(
    await authFetch(`${CONTENT_API}/manage/movies/${id}/reprocess`, { method: "POST" }),
    "movie",
  );
}

export async function deleteMovie(id: string): Promise<void> {
  await ensureOk(await authFetch(`${CONTENT_API}/manage/movies/${id}`, { method: "DELETE" }));
}

export function uploadMovie(formData: FormData, onProgress: (percent: number) => void): Promise<Movie> {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("POST", `${CONTENT_API}/manage/movies`);
    const accessToken = getAccessToken();
    if (accessToken) request.setRequestHeader("Authorization", `Bearer ${accessToken}`);
    request.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(Math.round((event.loaded / event.total) * 100));
    };
    request.onerror = () => reject(new Error("Не удалось загрузить фильм"));
    request.onload = () => {
      let payload: { movie?: Movie; message?: string | string[] } = {};
      try {
        payload = JSON.parse(request.responseText) as typeof payload;
      } catch {
        // The generic message below covers non-JSON upstream failures.
      }
      if (request.status >= 200 && request.status < 300 && payload.movie) {
        onProgress(100);
        resolve(payload.movie);
        return;
      }
      const message = Array.isArray(payload.message) ? payload.message.join(", ") : payload.message;
      reject(new Error(message || "Не удалось загрузить фильм"));
    };
    request.send(formData);
  });
}

interface ArticleListItem {
  id: string;
  title: string;
  status: ContentStatus;
}

interface ExerciseListItem {
  id: string;
  title: string | null;
  type: string;
  status: ContentStatus;
}

function jsonRequest(method: string, body: unknown): RequestInit {
  return {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  };
}

async function readItems(response: Response) {
  await ensureOk(response);
  return ((await response.json()) as { items: Course[] }).items;
}

async function readCourse(response: Response) {
  await ensureOk(response);
  return ((await response.json()) as { course: Course }).course;
}

async function readEntityItems<T>(response: Response): Promise<T[]> {
  await ensureOk(response);
  return ((await response.json()) as { items: T[] }).items;
}

async function readEntity<T>(response: Response, key: "article" | "exercise" | "movie"): Promise<T> {
  await ensureOk(response);
  return ((await response.json()) as Record<typeof key, T>)[key];
}

async function ensureOk(response: Response) {
  if (response.ok) return;
  let message = "Не удалось выполнить запрос";
  try {
    const payload = (await response.json()) as { message?: string | string[] };
    if (payload.message) message = Array.isArray(payload.message) ? payload.message.join(", ") : payload.message;
  } catch {
    // Keep the fallback message when the upstream does not return JSON.
  }
  throw new Error(message);
}
