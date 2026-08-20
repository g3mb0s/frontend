"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth/context";
import { cn } from "@/lib/utils/cn";

export function AppHeader() {
  const { logout, user } = useAuth();
  const pathname = usePathname();
  const canManage = user?.role === "manager" || user?.role === "admin";

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  const navLink = (href: string, label: string, accentClass: string) => (
    <Link
      href={href}
      className={cn(
        "rounded-lg px-3 py-2 transition",
        isActive(href)
          ? accentClass
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
      )}
    >
      {label}
    </Link>
  );

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-3 py-4 sm:gap-6 sm:px-6">
        <Link href="/" className={cn("shrink-0 text-lg font-bold tracking-tight", isActive("/") ? "text-indigo-700" : "text-slate-950")}>
          Gembos
        </Link>
        <nav className="flex min-w-0 items-center gap-1 overflow-x-auto text-sm font-medium sm:gap-2">
          {navLink("/courses", "Курсы", "bg-slate-100 text-slate-950")}
          {navLink("/movies", "Фильмы", "bg-slate-100 text-slate-950")}
          {navLink("/clips", "Повторение", "bg-slate-100 text-slate-950")}
          {navLink("/words", "Слова", "bg-slate-100 text-slate-950")}
          {navLink("/chat", "ИИ-чат", "bg-indigo-100 text-indigo-700")}
          {navLink("/characters", "Персонажи", "bg-sky-100 text-sky-700")}
          {canManage && (
            <Link
              href="/admin/courses"
              className={cn(
                "rounded-lg px-3 py-2 transition",
                isActive("/admin")
                  ? "bg-indigo-100 text-indigo-800"
                  : "text-indigo-700 hover:bg-indigo-50",
              )}
            >
              Админка
            </Link>
          )}
          <Link
            href="/profile"
            className={cn(
              "rounded-lg border border-slate-200 px-3 py-2 transition",
              isActive("/profile")
                ? "bg-indigo-100 text-indigo-800"
                : "text-slate-700 hover:bg-slate-50",
            )}
          >
            Профиль
          </Link>
          <Button variant="ghost" onClick={logout}>
            Выйти
          </Button>
        </nav>
      </div>
    </header>
  );
}
