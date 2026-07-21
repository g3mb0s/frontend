import type { ContentStatus } from "@/lib/content/types";

export function StatusBadge({ status }: { status: ContentStatus }) {
  const styles = status === "published" ? "bg-emerald-50 text-emerald-700" : status === "archived" ? "bg-slate-100 text-slate-600" : "bg-amber-50 text-amber-700";
  const label = status === "published" ? "Опубликован" : status === "archived" ? "Архив" : "Черновик";
  return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${styles}`}>{label}</span>;
}
