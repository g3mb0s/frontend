"use client";

import { useEffect, useRef } from "react";
import { CharacterAvatar } from "./character-avatar";
import { CharacterComposer } from "./character-composer";
import { CharacterMessages } from "./character-messages";
import { useCharacterChat } from "./use-character-chat";

export function CharacterChat({ characterId }: { characterId: string }) {
  const chat = useCharacterChat(characterId);
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = scroller.current;
    if (element) element.scrollTo({ top: element.scrollHeight, behavior: "smooth" });
  }, [chat.messages, chat.sending]);

  if (chat.state === "loading") {
    return <div className="grid h-[calc(100dvh-65px)] place-items-center bg-slate-50 text-sm text-slate-500">Loading character…</div>;
  }
  if (!chat.character) {
    return <div className="grid h-[calc(100dvh-65px)] place-items-center bg-slate-50"><div className="text-center"><p className="font-semibold text-slate-800">Character not found</p><button className="mt-3 text-sm text-sky-700 underline" onClick={() => void chat.load()}>Try again</button></div></div>;
  }

  return (
    <div className="flex h-[calc(100dvh-65px)] overflow-hidden bg-slate-100">
      <aside className="hidden w-72 shrink-0 flex-col border-r border-slate-200 bg-white lg:flex">
        <div className="border-b border-slate-100 p-6 text-center">
          <CharacterAvatar size="lg" name={chat.character.name} />
          <h1 className="mt-4 text-lg font-bold">{chat.character.name}</h1>
          <p className="mt-1 text-xs font-medium text-sky-700">AI English partner</p>
          <p className="mt-3 text-xs leading-5 text-slate-500">{chat.character.description}</p>
        </div>
        <div className="p-3">
          <button className="w-full rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-700" onClick={chat.startNew}>+ New conversation</button>
        </div>
        <p className="px-4 pb-2 pt-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Recent chats</p>
        <div className="flex-1 overflow-y-auto px-2">
          {chat.conversations.map((conversation) => (
            <button
              key={conversation.id}
              className={`mb-1 w-full truncate rounded-lg px-3 py-2.5 text-left text-sm transition ${chat.activeId === conversation.id ? "bg-sky-50 font-medium text-sky-800" : "text-slate-600 hover:bg-slate-100"}`}
              onClick={() => void chat.selectConversation(conversation.id)}
            >
              {conversation.title}
            </button>
          ))}
        </div>
        <p className="border-t border-slate-100 p-4 text-[10px] leading-4 text-slate-400">{chat.character.disclaimer}</p>
      </aside>

      <section className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <CharacterAvatar size="sm" name={chat.character.name} />
            <div>
              <p className="text-sm font-bold">{chat.character.name} <span className="font-normal text-slate-400">· AI</span></p>
              <p className="flex items-center gap-1.5 text-[11px] text-slate-500"><span className="size-1.5 rounded-full bg-emerald-500" />English practice</p>
            </div>
          </div>
          <button className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 lg:hidden" onClick={chat.startNew}>New chat</button>
        </header>
        <div ref={scroller} className="min-h-0 flex-1 overflow-y-auto">
          <CharacterMessages messages={chat.messages} greeting={chat.character.greeting} sending={chat.sending} error={chat.error} />
        </div>
        <CharacterComposer sending={chat.sending} onSend={chat.send} />
      </section>
    </div>
  );
}
