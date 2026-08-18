import type { CharacterMessage } from "@/lib/characters/types";
import { CharacterAvatar } from "./character-avatar";
import { QualityBadge } from "./quality-badge";

export function CharacterMessages({
  messages,
  greeting,
  sending,
  error,
  characterName,
  avatarUrl,
}: {
  messages: CharacterMessage[];
  greeting: string;
  sending: boolean;
  error: string | null;
  characterName: string;
  avatarUrl: string | null;
}) {
  return (
    <div className="mx-auto w-full max-w-2xl space-y-5 px-4 py-8 sm:px-6">
      {messages.length === 0 && (
        <div className="flex items-end gap-2">
          <CharacterAvatar size="sm" name={characterName} avatarUrl={avatarUrl} />
          <div className="max-w-[80%] rounded-2xl rounded-bl-md bg-white px-4 py-3 text-sm leading-6 text-slate-700 shadow-sm ring-1 ring-slate-200">
            {greeting}
          </div>
        </div>
      )}
      {messages.map((message) => message.role === "user" ? (
        <div key={message.id} className="flex items-center justify-end gap-2">
          <QualityBadge quality={message.quality} correction={message.correction} comment={message.comment} />
          <div className="max-w-[78%] whitespace-pre-wrap rounded-2xl rounded-br-md bg-sky-600 px-4 py-3 text-sm leading-6 text-white shadow-sm">
            {message.content}
          </div>
        </div>
      ) : (
        <div key={message.id} className="flex items-end gap-2">
          <CharacterAvatar size="sm" name={characterName} avatarUrl={avatarUrl} />
          <div className="max-w-[78%] whitespace-pre-wrap rounded-2xl rounded-bl-md bg-white px-4 py-3 text-sm leading-6 text-slate-700 shadow-sm ring-1 ring-slate-200">
            {message.content}
          </div>
        </div>
      ))}
      {sending && (
        <div className="flex items-center gap-2 text-xs text-slate-400" role="status">
          <CharacterAvatar size="sm" name={characterName} avatarUrl={avatarUrl} />
          <span className="flex gap-1 rounded-full bg-white px-4 py-3 ring-1 ring-slate-200">
            {[0, 1, 2].map((dot) => <i key={dot} className="size-1.5 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: `${dot * 120}ms` }} />)}
          </span>
          typing
        </div>
      )}
      {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{error}</div>}
    </div>
  );
}
