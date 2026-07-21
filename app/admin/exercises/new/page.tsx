import Link from "next/link";
import { ManagerRoute } from "@/components/auth/manager-route";
import { ExerciseEditor } from "@/components/content/exercise-editor";
import { AppHeader } from "@/components/layout/app-header";
export default function NewExercisePage() { return <ManagerRoute><div className="min-h-screen bg-slate-50"><AppHeader /><main className="mx-auto max-w-5xl px-6 py-10"><Link href="/admin/exercises" className="text-sm text-slate-500">← Упражнения</Link><h1 className="mt-4 text-3xl font-bold">Новое упражнение</h1><div className="mt-8"><ExerciseEditor /></div></main></div></ManagerRoute>; }
