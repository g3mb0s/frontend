"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  createCharacter,
  deleteCharacterAvatar,
  getManagedCharacter,
  updateCharacter,
  updateCharacterAvatar,
} from "@/lib/characters/api";
import type { CharacterInput } from "@/lib/characters/types";

const emptyCharacter: CharacterInput = {
  id: "",
  name: "",
  description: "",
  greeting: "",
  character_prompt: "",
  is_active: true,
};

export function useCharacterEditor(characterId?: string) {
  const router = useRouter();
  const [character, setCharacter] = useState<CharacterInput>(emptyCharacter);
  const [loading, setLoading] = useState(Boolean(characterId));
  const [saving, setSaving] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [originallyHadPrompt, setOriginallyHadPrompt] = useState(false);

  useEffect(() => {
    if (!characterId) return;
    void getManagedCharacter(characterId)
      .then((value) => {
        setCharacter({
          id: value.id,
          name: value.name,
          description: value.description,
          greeting: value.greeting,
          character_prompt: value.character_prompt ?? "",
          is_active: value.is_active,
        });
        setOriginallyHadPrompt(Boolean(value.character_prompt));
        setAvatarUrl(value.avatar_url);
      })
      .catch((error: Error) => setMessage(error.message))
      .finally(() => setLoading(false));
  }, [characterId]);

  function update(patch: Partial<CharacterInput>) {
    setCharacter((current) => ({ ...current, ...patch }));
  }

  async function save() {
    if (
      characterId &&
      originallyHadPrompt &&
      !character.character_prompt.trim()
    ) {
      setMessage("Заполните описание персонажа для AI (промт)");
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      if (characterId) {
        await updateCharacter(characterId, {
          name: character.name,
          description: character.description,
          greeting: character.greeting,
          character_prompt: character.character_prompt,
          is_active: character.is_active,
        });
        setMessage("Изменения сохранены");
      } else {
        const created = await createCharacter(character);
        router.replace(`/admin/characters/${created.id}`);
      }
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Не удалось сохранить персонажа",
      );
    } finally {
      setSaving(false);
    }
  }

  async function changeAvatar(file: File) {
    if (!characterId) return;
    setUploadingAvatar(true);
    setMessage(null);
    try {
      const updated = await updateCharacterAvatar(characterId, file);
      setAvatarUrl(updated.avatar_url);
      setMessage("Аватар обновлён");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Не удалось обновить аватар",
      );
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function removeAvatar() {
    if (!characterId) return;
    setUploadingAvatar(true);
    setMessage(null);
    try {
      await deleteCharacterAvatar(characterId);
      setAvatarUrl(null);
      setMessage("Аватар удалён");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Не удалось удалить аватар",
      );
    } finally {
      setUploadingAvatar(false);
    }
  }

  return {
    character,
    avatarUrl,
    loading,
    saving,
    uploadingAvatar,
    message,
    originallyHadPrompt,
    update,
    save,
    changeAvatar,
    removeAvatar,
  };
}
