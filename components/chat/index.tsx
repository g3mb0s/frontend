"use client";

import { useEffect, useRef, useState } from "react";
import { ChatComposer } from "./chat-composer";
import { MenuIcon, SparkleIcon } from "./chat-icons";
import { ChatMessages } from "./chat-messages";
import { ChatSidebar } from "./chat-sidebar";
import { ChatWelcome } from "./chat-welcome";
import { useChat } from "./use-chat";

export function Chat() {
  const chat = useChat();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const scrollArea = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = scrollArea.current;
    if (element) element.scrollTo({ top: element.scrollHeight, behavior: "smooth" });
  }, [chat.messages, chat.isSending]);

  return (
    <div className="flex h-[calc(100dvh-65px)] overflow-hidden bg-white text-slate-950">
      <ChatSidebar
        conversations={chat.conversations}
        activeId={chat.activeId}
        state={chat.listState}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onNew={chat.startNewConversation}
        onRetry={() => void chat.loadConversations()}
        onSelect={(id) => void chat.selectConversation(id)}
      />

      <section className="flex min-w-0 flex-1 flex-col bg-white">
        <div className="flex h-14 shrink-0 items-center gap-3 border-b border-slate-100 px-4 md:px-6">
          <button className="grid size-9 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 md:hidden" aria-label="Открыть историю" onClick={() => setIsSidebarOpen(true)}>
            <MenuIcon className="size-5" />
          </button>
          <div className="flex items-center gap-2 text-sm font-semibold">
            <SparkleIcon className="size-4 text-indigo-600" />
            Gembos AI
          </div>
          <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">онлайн</span>
        </div>

        <div ref={scrollArea} className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          {chat.messages.length === 0 && chat.messageState === "ready" && !chat.isSending && !chat.error
            ? <ChatWelcome onSelect={(prompt) => void chat.sendMessage(prompt)} />
            : <ChatMessages messages={chat.messages} state={chat.messageState} isSending={chat.isSending} error={chat.error} />
          }
        </div>
        <ChatComposer isSending={chat.isSending} onSend={chat.sendMessage} />
      </section>
    </div>
  );
}
