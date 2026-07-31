"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/form-controls";
import { listMovies } from "@/lib/content/api";
import type { MoviePage } from "@/lib/content/types";

const PAGE_SIZE = 12;

export function MovieCatalog() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<MoviePage | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    const controller = new AbortController();
    void listMovies({ search, page, pageSize: PAGE_SIZE }, controller.signal)
      .then((nextResult) => {
        setResult(nextResult);
        setState("ready");
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setState("error");
      });
    return () => controller.abort();
  }, [page, search]);

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextSearch = searchInput.trim();
    if (nextSearch === search && page === 1) return;
    setState("loading");
    setPage(1);
    setSearch(nextSearch);
  }

  function changePage(nextPage: number) {
    setState("loading");
    setPage(nextPage);
  }

  const movies = result?.items ?? [];
  const pagination = result?.pagination;

  return (
    <section className="mt-10">
      <form onSubmit={submitSearch} className="flex max-w-xl gap-2" role="search">
        <Input
          type="search"
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          placeholder="Название фильма"
          aria-label="Поиск фильмов по названию"
        />
        <Button type="submit" variant="primary">Найти</Button>
      </form>

      {state === "error" && (
        <p className="mt-8 rounded-xl bg-red-50 p-4 text-sm text-red-700">Не удалось загрузить фильмы.</p>
      )}

      {state !== "error" && !result && (
        <p className="mt-8 text-sm text-slate-500">Загружаем фильмы…</p>
      )}

      {result && (
        <>
          <div className="mt-6 flex items-center justify-between gap-4 text-sm text-slate-500">
            <p>{search ? `По запросу «${search}» найдено: ${pagination?.total ?? 0}` : `Фильмов: ${pagination?.total ?? 0}`}</p>
            {state === "loading" && <p>Обновляем…</p>}
          </div>

          {!movies.length ? (
            <p className="mt-6 rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
              {search ? "По вашему запросу фильмы не найдены." : "Готовых фильмов пока нет."}
            </p>
          ) : (
            <div className={`mt-6 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 ${state === "loading" ? "opacity-60" : ""}`}>
              {movies.map((movie) => (
                <Link key={movie.id} href={`/movies/${movie.id}`} className="group min-w-0">
                  <div className="aspect-[2/3] overflow-hidden rounded-xl bg-slate-200 shadow-sm ring-1 ring-slate-200 transition group-hover:-translate-y-1 group-hover:shadow-lg group-hover:ring-indigo-300">
                    {movie.thumbnail_url ? (
                      // Object storage has a runtime-configured public origin, so next/image cannot whitelist it at build time.
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={movie.thumbnail_url}
                        alt={`Постер фильма «${movie.title}»`}
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-300 px-4 text-center text-sm font-medium text-slate-500">
                        Нет постера
                      </div>
                    )}
                  </div>
                  <h2 className="mt-3 truncate font-semibold text-slate-950 group-hover:text-indigo-700">{movie.title}</h2>
                  <p className="mt-1 text-sm text-slate-500">{movie.clips.length} клипов · {formatDuration(movie.duration_ms)}</p>
                </Link>
              ))}
            </div>
          )}

          {pagination && pagination.total_pages > 1 && (
            <Pagination
              page={pagination.page}
              totalPages={pagination.total_pages}
              onChange={changePage}
              disabled={state === "loading"}
            />
          )}
        </>
      )}
    </section>
  );
}

function Pagination({
  page,
  totalPages,
  onChange,
  disabled,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
  disabled: boolean;
}) {
  return (
    <nav className="mt-10 flex flex-wrap items-center justify-center gap-2" aria-label="Пагинация фильмов">
      <Button onClick={() => onChange(page - 1)} disabled={disabled || page === 1}>Назад</Button>
      {visiblePages(page, totalPages).map((item, index) =>
        item === "ellipsis" ? (
          <span key={`ellipsis-${index}`} className="px-1 text-slate-400">…</span>
        ) : (
          <Button
            key={item}
            variant={item === page ? "primary" : "secondary"}
            onClick={() => onChange(item)}
            disabled={disabled}
            aria-current={item === page ? "page" : undefined}
          >
            {item}
          </Button>
        ),
      )}
      <Button onClick={() => onChange(page + 1)} disabled={disabled || page === totalPages}>Вперёд</Button>
    </nav>
  );
}

function visiblePages(current: number, total: number): Array<number | "ellipsis"> {
  if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1);
  const pages = new Set([1, total, current - 1, current, current + 1]);
  const sorted = [...pages].filter((page) => page >= 1 && page <= total).sort((a, b) => a - b);
  const result: Array<number | "ellipsis"> = [];
  sorted.forEach((page, index) => {
    if (index > 0 && page - sorted[index - 1] > 1) result.push("ellipsis");
    result.push(page);
  });
  return result;
}

function formatDuration(durationMs: number | null) {
  if (!durationMs) return "длительность неизвестна";
  const minutes = Math.round(durationMs / 60_000);
  return `${minutes} мин`;
}
