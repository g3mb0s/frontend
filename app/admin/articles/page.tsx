"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ManagerRoute } from "@/components/auth/manager-route";
import { StatusBadge } from "@/components/content/status-badge";
import { AdminNav } from "@/components/layout/admin-nav";
import { AppHeader } from "@/components/layout/app-header";
import { deleteArticle, listManagedArticles } from "@/lib/content/api";
import type { Article } from "@/lib/content/types";

export default function AdminArticlesPage() {
  const [items, setItems] = useState<Article[]>([]);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  async function load(query = search) { try { setItems(await listManagedArticles(query)); } catch (error) { setMessage(error instanceof Error ? error.message : "Ошибка загрузки"); } }
  useEffect(() => { void listManagedArticles().then(setItems).catch((error: Error) => setMessage(error.message)); }, []);
  async function remove(id: string) { if (!window.confirm("Удалить статью?")) return; try { await deleteArticle(id); await load(); } catch (error) { setMessage(error instanceof Error ? error.message : "Ошибка удаления"); } }

  return <ManagerRoute><div className="min-h-screen bg-slate-50 text-slate-950"><AppHeader /><main className="mx-auto max-w-6xl px-6 py-10"><AdminNav /><div className="flex flex-wrap items-end justify-between gap-5"><div><p className="text-sm font-semibold uppercase tracking-[0.16em] text-indigo-600">Управление контентом</p><h1 className="mt-2 text-3xl font-bold">Статьи</h1></div><Link href="/admin/articles/new" className={primaryButton}>Новая статья</Link></div><div className="mt-6 flex gap-2"><input value={search} onChange={(event) => setSearch(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") void load(); }} className={inputClass} placeholder="Поиск по названию" /><button type="button" onClick={() => void load()} className={secondaryButton}>Найти</button></div>{message && <p className="mt-4 text-sm text-red-600">{message}</p>}<div className="mt-6 divide-y divide-slate-200 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">{items.length === 0 ? <p className="p-10 text-center text-sm text-slate-500">Статей пока нет.</p> : items.map((article) => <div key={article.id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"><div><div className="flex items-center gap-3"><h2 className="font-semibold">{article.title}</h2><StatusBadge status={article.status} /></div><p className="mt-1 text-sm text-slate-500">{article.blocks.length} блоков · {article.tags.join(", ") || "без тегов"}</p></div><div className="flex gap-2"><Link href={`/admin/articles/${article.id}`} className={secondaryButton}>Редактировать</Link><button type="button" onClick={() => void remove(article.id)} className="rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50">Удалить</button></div></div>)}</div></main></div></ManagerRoute>;
}

const inputClass = "min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500";
const secondaryButton = "rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium hover:bg-slate-50";
const primaryButton = "rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white";
