"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useAuth } from "@/lib/auth/context";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { status, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "loading") return;

    if (status === "anonymous") {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }

    if (!user?.emailVerified) {
      router.replace("/verify-email");
    }
  }, [pathname, router, status, user]);

  if (status === "loading" || status === "anonymous" || !user?.emailVerified) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white text-sm text-slate-500">
        Загрузка...
      </main>
    );
  }

  return children;
}
