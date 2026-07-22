import { Button } from "./button";

export function OrderControls({ index, length, onMove, className = "flex gap-1" }: { index: number; length: number; onMove: (direction: -1 | 1) => void; className?: string }) {
  return (
    <div className={className}>
      <Button size="sm" variant="ghost" disabled={index === 0} onClick={() => onMove(-1)} aria-label="Переместить вверх">↑</Button>
      <Button size="sm" variant="ghost" disabled={index === length - 1} onClick={() => onMove(1)} aria-label="Переместить вниз">↓</Button>
    </div>
  );
}
