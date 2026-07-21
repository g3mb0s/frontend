"use client";
import Link from "next/link";
import { use } from "react";
import { ManagerRoute } from "@/components/auth/manager-route";
import { ArticleEditor } from "@/components/content/article-editor";
import { AppHeader } from "@/components/layout/app-header";
export default function EditArticlePage({ params }: { params: Promise<{ id: string }> }) { const { id } = use(params); return <ManagerRoute><div className="min-h-screen bg-slate-50"><AppHeader /><main className="mx-auto max-w-5xl px-6 py-10"><Link href="/admin/articles" className="text-sm text-slate-500">← Статьи</Link><h1 className="mt-4 text-3xl font-bold">Редактирование статьи</h1><div className="mt-8"><ArticleEditor articleId={id} /></div></main></div></ManagerRoute>; }
