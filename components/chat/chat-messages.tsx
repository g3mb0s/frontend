import type { ChatMessage } from "@/lib/ai/types";
import { SparkleIcon } from "./chat-icons";
import { MarkdownMessage } from "./markdown-message";

interface ChatMessagesProps {
  messages: ChatMessage[];
  state: "loading" | "ready" | "error";
  isSending: boolean;
  error: string | null;
}

export function ChatMessages({ messages, state, isSending, error }: ChatMessagesProps) {
  if (state === "loading") {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-7 px-5 py-10">
        <div className="h-20 w-2/3 animate-pulse self-end rounded-3xl bg-slate-200" />
        <div className="h-32 w-5/6 animate-pulse rounded-3xl bg-slate-100" />
      </div>
    );
  }

  if (state === "error" && messages.length === 0) {
    return (
      <div className="grid flex-1 place-items-center px-6 text-center">
        <div>
          <p className="font-semibold text-slate-800">Диалог не загрузился</p>
          <p className="mt-2 text-sm text-slate-500">Выберите его повторно или начните новый.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
      <div className="space-y-8">
        {messages.map((message) => (
          <article key={message.id} className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
            {message.role === "assistant" && (
              <div className="mt-1 grid size-8 shrink-0 place-items-center rounded-full bg-indigo-600 text-white shadow-sm">
                <SparkleIcon className="size-4" />
              </div>
            )}
            <div className={message.role === "user"
              ? "max-w-[85%] whitespace-pre-wrap rounded-3xl rounded-br-lg bg-slate-200 px-5 py-3 text-[15px] leading-7 text-slate-900 sm:max-w-[75%]"
              : "min-w-0 max-w-[calc(100%-2.75rem)] pt-1 text-[15px] leading-7 text-slate-800"
            }>
              {message.role === "assistant"
                ? <MarkdownMessage>{message.content}</MarkdownMessage>
                : message.content
              }
            </div>
          </article>
        ))}
        {isSending && (
          <div className="flex items-center gap-3 text-sm text-slate-400" role="status">
            <div className="grid size-8 place-items-center rounded-full bg-indigo-600 text-white">
              <SparkleIcon className="size-4" />
            </div>
            <span className="flex gap-1">
              {[0, 1, 2].map((item) => <i key={item} className="size-1.5 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: `${item * 120}ms` }} />)}
            </span>
            ИИ думает
          </div>
        )}
        {error && (
          <div className="ml-11 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
