"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  createCharacter,
  getManagedCharacter,
  updateCharacter,
} from "@/lib/characters/api";
import type { CharacterInput } from "@/lib/characters/types";

const emptyCharacter: CharacterInput = {
  id: "",
  name: "",
  description: "",
  greeting: "",
  disclaimer: "",
  instructions: "",
  is_active: true,
};

export function useCharacterEditor(characterId?: string) {
  const router = useRouter();
  const [character, setCharacter] = useState<CharacterInput>(emptyCharacter);
  const [loading, setLoading] = useState(Boolean(characterId));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!characterId) return;
    void getManagedCharacter(characterId)
      .then((value) => {
        setCharacter({
          id: value.id,
          name: value.name,
          description: value.description,
          greeting: value.greeting,
          disclaimer: value.disclaimer,
          instructions: value.instructions,
          is_active: value.is_active,
        });
      })
      .catch((error: Error) => setMessage(error.message))
      .finally(() => setLoading(false));
  }, [characterId]);

  function update(patch: Partial<CharacterInput>) {
    setCharacter((current) => ({ ...current, ...patch }));
  }

  async function save() {
    setSaving(true);
    setMessage(null);
    try {
      if (characterId) {
        await updateCharacter(characterId, {
          name: character.name,
          description: character.description,
          greeting: character.greeting,
          disclaimer: character.disclaimer,
          instructions: character.instructions,
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

  return { character, loading, saving, message, update, save };
}
