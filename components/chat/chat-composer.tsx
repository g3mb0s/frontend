"use client";

import { MessageComposer } from "@/components/ui/message-composer";
import { SendIcon } from "./chat-icons";

interface ChatComposerProps {
  isSending: boolean;
  onSend: (message: string) => Promise<boolean>;
}

export function ChatComposer({ isSending, onSend }: ChatComposerProps) {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-4 sm:px-6">
      <MessageComposer
        isSending={isSending}
        onSend={onSend}
        accent="indigo"
        maxLength={20000}
        placeholder="Спросите что-нибудь об английском…"
        ariaLabel="Сообщение"
        hint="Enter — отправить, Shift + Enter — новая строка"
        sendIcon={<SendIcon className="size-5" />}
      />
    </div>
  );
}
