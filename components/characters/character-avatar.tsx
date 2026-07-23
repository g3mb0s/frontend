import { cn } from "@/lib/utils/cn";

export function CharacterAvatar({
  size = "md",
}: {
  size?: "sm" | "md" | "lg";
}) {
  return (
    <div
      className={cn(
        "relative grid shrink-0 place-items-center overflow-hidden rounded-full bg-gradient-to-br from-sky-400 via-white to-sky-200 font-black text-sky-950 ring-1 ring-sky-200",
        size === "sm" && "size-9 text-xs",
        size === "md" && "size-12 text-sm",
        size === "lg" && "size-20 text-xl",
      )}
      aria-label="Lionel Messi AI avatar"
    >
      <span className="absolute inset-x-0 bottom-0 h-2/5 bg-sky-600" />
      <span className="relative">10</span>
    </div>
  );
}
