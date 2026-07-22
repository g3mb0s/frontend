import type { ReactNode } from "react";
import { Button } from "./button";
import { cn } from "@/lib/utils/cn";

export function Modal({ title, eyebrow, onClose, children, className }: { title: string; eyebrow?: string; onClose: () => void; children: ReactNode; className?: string }) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={title}>
      <div className={cn("mx-auto my-8 max-w-3xl rounded-3xl bg-white p-8 shadow-2xl", className)}>
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>{eyebrow && <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">{eyebrow}</p>}<h2 className={cn("text-2xl font-bold", eyebrow && "mt-1")}>{title}</h2></div>
          <Button variant="ghost" onClick={onClose}>Закрыть</Button>
        </div>
        {children}
      </div>
    </div>
  );
}
