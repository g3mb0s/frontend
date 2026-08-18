"use client";

import { EditorActions } from "@/components/ui/editor-actions";
import { CharacterForm } from "./character-form";
import { useCharacterEditor } from "./use-character-editor";

export function CharacterEditor({ characterId }: { characterId?: string }) {
  const editor = useCharacterEditor(characterId);

  if (editor.loading) {
    return <p className="py-10 text-sm text-slate-500">Загружаем персонажа…</p>;
  }

  return (
    <div className="space-y-6">
      <CharacterForm
        character={editor.character}
        editing={Boolean(characterId)}
        originallyHadPrompt={editor.originallyHadPrompt}
        onChange={editor.update}
        avatarUrl={editor.avatarUrl}
        uploadingAvatar={editor.uploadingAvatar}
        onAvatarChange={(file) => void editor.changeAvatar(file)}
        onAvatarRemove={() => void editor.removeAvatar()}
      />
      <EditorActions
        message={editor.message}
        saving={editor.saving}
        onSave={() => void editor.save()}
      />
    </div>
  );
}
