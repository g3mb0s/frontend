import { SparkleIcon } from "./chat-icons";
import { STARTER_PROMPTS } from "./model";

export function ChatWelcome({ onSelect }: { onSelect: (prompt: string) => void }) {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-5 py-10">
      <div className="mx-auto max-w-xl text-center">
        <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-700 text-white shadow-lg shadow-indigo-200">
          <SparkleIcon className="size-7" />
        </div>
        <h1 className="mt-5 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Чем помочь сегодня?</h1>
        <p className="mt-3 text-sm leading-6 text-slate-500 sm:text-base">Ваш ИИ-наставник по английскому. Задайте вопрос или выберите идею для начала.</p>
      </div>
      <div className="mt-9 grid gap-3 sm:grid-cols-2">
        {STARTER_PROMPTS.map((prompt) => (
          <button key={prompt} className="rounded-2xl border border-slate-200 bg-white p-4 text-left text-sm leading-6 text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-300 hover:text-indigo-800 hover:shadow-md" onClick={() => onSelect(prompt)}>
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
}
