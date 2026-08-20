import type { SrsStats } from "@/lib/srs/types";
import { Card } from "@/components/ui/card";

const ROWS: Array<{ label: string; key: keyof SrsStats; tone: string }> = [
  { label: "Новых доступно", key: "new", tone: "text-slate-900" },
  { label: "Повторяются", key: "learning", tone: "text-indigo-600" },
  { label: "Изучено", key: "learned", tone: "text-emerald-600" },
  { label: "С ошибками", key: "with_errors", tone: "text-amber-600" },
  { label: "Знакомые", key: "known", tone: "text-slate-500" },
];

export function StatsPanel({ stats }: { stats: SrsStats }) {
  return (
    <Card className="p-5">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Статистика</h3>
      <dl className="mt-4 space-y-3">
        {ROWS.map((row) => (
          <div key={row.key} className="flex items-center justify-between">
            <dt className="text-sm text-slate-600">{row.label}</dt>
            <dd className={`text-sm font-semibold ${row.tone}`}>{stats[row.key]}</dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}
