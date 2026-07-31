"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/cn";

export function CharacterAvatar({
  size = "md",
  name = "AI",
  avatarUrl,
}: {
  size?: "sm" | "md" | "lg";
  name?: string;
  avatarUrl?: string | null;
}) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);

  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toLocaleUpperCase())
    .join("") || "AI";

  return (
    <div
      className={cn(
        "relative grid shrink-0 place-items-center overflow-hidden rounded-full bg-gradient-to-br from-sky-400 via-white to-sky-200 font-black text-sky-950 ring-1 ring-sky-200",
        size === "sm" && "size-9 text-xs",
        size === "md" && "size-12 text-sm",
        size === "lg" && "size-20 text-xl",
      )}
      aria-label={`${name} AI avatar`}
    >
      <span className="absolute inset-x-0 bottom-0 h-2/5 bg-sky-600" />
      <span className="relative">{initials}</span>
      {avatarUrl && avatarUrl !== failedUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={avatarUrl}
          alt=""
          className="absolute inset-0 size-full object-cover"
          onError={() => setFailedUrl(avatarUrl)}
        />
      )}
    </div>
  );
}
