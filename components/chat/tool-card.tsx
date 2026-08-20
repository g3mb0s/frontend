import type { ActiveToolState } from "./use-chat";
import { DatabaseIcon } from "./chat-icons";

interface ToolCardProps {
  tool: ActiveToolState;
}

export function ToolCard({ tool }: ToolCardProps) {
  return (
    <div className="ml-11 max-w-[calc(100%-2.75rem)] rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <div className="flex items-center gap-2.5 text-sm font-semibold text-slate-800">
        <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-indigo-100 text-indigo-700">
          <DatabaseIcon className="size-4" />
        </span>
        <span className="truncate">{tool.name}</span>
        {tool.status === "executing" && (
          <span className="ml-auto flex items-center gap-1 text-xs font-normal text-slate-400">
            <span className="size-3 animate-spin rounded-full border-2 border-slate-300 border-t-indigo-600" aria-hidden="true" />
            Получаю слова…
          </span>
        )}
        {tool.status === "done" && tool.wordCount !== undefined && (
          <span className="ml-auto text-xs font-normal text-slate-500">
            {formatWordCount(tool.wordCount)}
          </span>
        )}
      </div>

      {tool.status === "executing" && (
        <p className="mt-1.5 text-sm text-slate-500">
          {tool.note || "Обращаюсь к вашим словам…"}
        </p>
      )}

      {tool.status === "done" && tool.words && tool.words.length > 0 && (
        <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
          {tool.words.map((word) => (
            <li key={word.id} className="text-sm text-slate-700">
              <span className="font-medium">{word.word}</span>
              <span className="text-slate-400"> — {word.translation}</span>
            </li>
          ))}
        </ul>
      )}

      {tool.status === "done" && tool.words && tool.words.length === 0 && (
        <p className="mt-1.5 text-sm text-slate-500">Подходящих слов не нашлось.</p>
      )}

      {tool.status === "error" && (
        <p className="mt-1.5 text-sm text-red-600" role="alert">
          {tool.error ?? "Не удалось получить слова"}
        </p>
      )}
    </div>
  );
}

function formatWordCount(count: number): string {
  const lastDigit = count % 10;
  const lastTwo = count % 100;
  let form: string;
  if (lastTwo >= 11 && lastTwo <= 14) {
    form = "слов";
  } else if (lastDigit === 1) {
    form = "слово";
  } else if (lastDigit >= 2 && lastDigit <= 4) {
    form = "слова";
  } else {
    form = "слов";
  }
  return `Получено ${count} ${form}`;
}
