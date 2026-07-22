import Link from "next/link";
import type { ReactNode } from "react";
import { ManagerRoute } from "@/components/auth/manager-route";
import { AdminNav } from "@/components/layout/admin-nav";
import { AppHeader } from "@/components/layout/app-header";
import { buttonClassName } from "@/components/ui/button";

export function AdminPage({ title, description, createHref, createLabel, children }: { title: string; description?: string; createHref: string; createLabel: string; children: ReactNode }) {
  return (
    <ManagerRoute>
      <div className="min-h-screen bg-slate-50 text-slate-950">
        <AppHeader />
        <main className="mx-auto max-w-6xl px-6 py-10">
          <AdminNav />
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div><p className="text-sm font-semibold uppercase tracking-[0.16em] text-indigo-600">Управление контентом</p><h1 className="mt-2 text-3xl font-bold tracking-tight">{title}</h1>{description && <p className="mt-2 text-sm text-slate-500">{description}</p>}</div>
            <Link href={createHref} className={buttonClassName({ variant: "primary", className: "px-4 py-2.5 font-semibold" })}>{createLabel}</Link>
          </div>
          {children}
        </main>
      </div>
    </ManagerRoute>
  );
}

export function AdminMessage({ children }: { children: ReactNode }) {
  return <p className="mt-6 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">{children}</p>;
}
