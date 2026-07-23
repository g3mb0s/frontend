import { ChatIcon, CloseIcon, PlusIcon } from "./chat-icons";
import { formatConversationDate } from "./model";
import type { ConversationSummary } from "@/lib/ai/types";

interface ChatSidebarProps {
  conversations: ConversationSummary[];
  activeId: string | null;
  state: "loading" | "ready" | "error";
  isOpen: boolean;
  onClose: () => void;
  onNew: () => void;
  onRetry: () => void;
  onSelect: (id: string) => void;
}

export function ChatSidebar({
  conversations,
  activeId,
  state,
  isOpen,
  onClose,
  onNew,
  onRetry,
  onSelect,
}: ChatSidebarProps) {
  return (
    <>
      {isOpen && <button className="fixed inset-0 z-30 bg-slate-950/30 md:hidden" aria-label="Закрыть историю" onClick={onClose} />}
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-[min(20rem,88vw)] flex-col border-r border-slate-200 bg-slate-50 transition-transform md:static md:z-auto md:w-72 md:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center gap-2 p-3">
          <button
            className="flex min-w-0 flex-1 items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-3 text-left text-sm font-semibold text-slate-800 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50"
            onClick={() => {
              onNew();
              onClose();
            }}
          >
            <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-indigo-600 text-white">
              <PlusIcon className="size-4" />
            </span>
            Новый диалог
          </button>
          <button className="grid size-10 place-items-center rounded-lg text-slate-500 hover:bg-slate-200 md:hidden" aria-label="Закрыть меню" onClick={onClose}>
            <CloseIcon className="size-5" />
          </button>
        </div>

        <div className="px-4 pb-2 pt-4 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
          История
        </div>
        <div className="flex-1 overflow-y-auto px-2 pb-4">
          {state === "loading" && (
            <div className="space-y-2 p-2" aria-label="Загружаем историю">
              {[0, 1, 2].map((item) => <div key={item} className="h-12 animate-pulse rounded-xl bg-slate-200/70" />)}
            </div>
          )}
          {state === "error" && (
            <div className="m-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs leading-5 text-red-700">
              Не удалось загрузить историю.
              <button className="mt-2 block font-semibold underline underline-offset-2" onClick={onRetry}>Повторить</button>
            </div>
          )}
          {state === "ready" && conversations.length === 0 && (
            <p className="px-3 py-6 text-center text-xs leading-5 text-slate-400">Здесь появятся ваши диалоги</p>
          )}
          {conversations.map((conversation) => (
            <button
              key={conversation.id}
              className={`group mb-1 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition ${activeId === conversation.id ? "bg-white text-slate-950 shadow-sm ring-1 ring-slate-200" : "text-slate-600 hover:bg-slate-200/70"}`}
              onClick={() => {
                onSelect(conversation.id);
                onClose();
              }}
            >
              <ChatIcon className="size-4 shrink-0 text-slate-400 group-hover:text-indigo-600" />
              <span className="min-w-0 flex-1 truncate text-sm font-medium">{conversation.title}</span>
              <span className="shrink-0 text-[10px] text-slate-400">{formatConversationDate(conversation.updated_at)}</span>
            </button>
          ))}
        </div>
        <div className="border-t border-slate-200 px-4 py-3 text-xs leading-5 text-slate-400">
          ИИ может ошибаться. Проверяйте важную информацию.
        </div>
      </aside>
    </>
  );
}
