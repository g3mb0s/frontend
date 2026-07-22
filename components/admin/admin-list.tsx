import Link from "next/link";
import { Children, type ReactNode } from "react";
import { Button, buttonClassName } from "@/components/ui/button";
import { Input } from "@/components/ui/form-controls";

export function AdminSearch({ value, onChange, onSearch }: { value: string; onChange: (value: string) => void; onSearch: () => void }) {
  return <div className="mt-6 flex gap-2"><Input value={value} onChange={(event) => onChange(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") onSearch(); }} className="min-w-0 flex-1" placeholder="Поиск по названию" /><Button onClick={onSearch}>Найти</Button></div>;
}

export function AdminList({ emptyLabel, children }: { emptyLabel: string; children: ReactNode }) {
  return <div className="mt-6 divide-y divide-slate-200 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">{Children.count(children) > 0 ? children : <p className="p-10 text-center text-sm text-slate-500">{emptyLabel}</p>}</div>;
}

export function AdminListItem({ title, badge, description, editHref, onDelete, children }: { title: string; badge?: ReactNode; description: ReactNode; editHref: string; onDelete: () => void; children?: ReactNode }) {
  return (
    <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div><div className="flex items-center gap-3"><h2 className="font-semibold">{title}</h2>{badge}</div><p className="mt-1 text-sm text-slate-500">{description}</p></div>
      <div className="flex items-center gap-2"><Link href={editHref} className={buttonClassName()}>Редактировать</Link>{children}<Button variant="danger" onClick={onDelete}>Удалить</Button></div>
    </div>
  );
}
