import { Button } from "./button";

export function EditorActions({ message, saving, savingLabel = "Сохраняем…", onPreview, onSave }: { message: string | null; saving: boolean; savingLabel?: string; onPreview: () => void; onSave: () => void }) {
  const success = message?.includes("сохранены");

  return (
    <div className="sticky bottom-4 flex items-center justify-between rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-lg backdrop-blur">
      <p className={success ? "text-sm text-emerald-700" : "text-sm text-red-600"}>{message}</p>
      <div className="flex gap-2">
        <Button onClick={onPreview}>Предпросмотр</Button>
        <Button variant="primary" disabled={saving} onClick={onSave}>{saving ? savingLabel : "Сохранить"}</Button>
      </div>
    </div>
  );
}
