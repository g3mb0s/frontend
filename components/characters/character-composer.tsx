"use client";

import { MessageComposer } from "@/components/ui/message-composer";

export function CharacterComposer({
  sending,
  onSend,
}: {
  sending: boolean;
  onSend: (content: string) => Promise<boolean>;
}) {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 pb-4 sm:px-6">
      <MessageComposer
        isSending={sending}
        onSend={onSend}
        accent="sky"
        maxLength={2000}
        placeholder="Write a message in English…"
        ariaLabel="Message in English"
        hint="English only · Your message will receive a score"
      />
    </div>
  );
}
