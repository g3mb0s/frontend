import Link from "next/link";
import { ManagerRoute } from "@/components/auth/manager-route";
import { WordEditor } from "@/components/content/word-editor";
import { AppHeader } from "@/components/layout/app-header";
export default function NewWordPage() { return <ManagerRoute><div className="min-h-screen bg-slate-50"><AppHeader /><main className="mx-auto max-w-5xl px-6 py-10"><Link href="/admin/words" className="text-sm text-slate-500">← Слова</Link><h1 className="mt-4 text-3xl font-bold">Новое слово</h1><div className="mt-8"><WordEditor /></div></main></div></ManagerRoute>; }
