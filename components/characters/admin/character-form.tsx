import { Card } from "@/components/ui/card";
import { Button, buttonClassName } from "@/components/ui/button";
import { CharacterAvatar } from "@/components/characters/character-avatar";
import { Checkbox, Field, Input, Textarea } from "@/components/ui/form-controls";
import type { CharacterInput } from "@/lib/characters/types";

export function CharacterForm({
  character,
  editing,
  originallyHadPrompt,
  onChange,
  avatarUrl,
  uploadingAvatar,
  onAvatarChange,
  onAvatarRemove,
}: {
  character: CharacterInput;
  editing: boolean;
  originallyHadPrompt: boolean;
  onChange: (patch: Partial<CharacterInput>) => void;
  avatarUrl: string | null;
  uploadingAvatar: boolean;
  onAvatarChange: (file: File) => void;
  onAvatarRemove: () => void;
}) {
  return (
    <div className="space-y-6">
      <Card>
        {editing && (
          <div className="mb-6 flex flex-wrap items-center gap-4 border-b border-slate-100 pb-6">
            <CharacterAvatar
              size="lg"
              name={character.name}
              avatarUrl={avatarUrl}
            />
            <div>
              <p className="mb-2 text-sm font-semibold text-slate-800">Аватар</p>
              <div className="flex flex-wrap gap-2">
                <label
                  className={buttonClassName({
                    variant: "secondary",
                    className: uploadingAvatar
                      ? "pointer-events-none cursor-not-allowed opacity-40"
                      : "cursor-pointer",
                  })}
                >
                  {uploadingAvatar ? "Загрузка…" : "Выбрать изображение"}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="sr-only"
                    disabled={uploadingAvatar}
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) onAvatarChange(file);
                      event.target.value = "";
                    }}
                  />
                </label>
                {avatarUrl && (
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={uploadingAvatar}
                    onClick={onAvatarRemove}
                  >
                    Удалить
                  </Button>
                )}
              </div>
              <p className="mt-2 text-xs text-slate-500">
                JPEG, PNG или WebP, не более 5 МБ.
              </p>
            </div>
          </div>
        )}
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="ID персонажа">
            <Input
              value={character.id}
              disabled={editing}
              onChange={(event) => onChange({ id: event.target.value.toLocaleLowerCase() })}
              placeholder="sherlock-holmes"
              pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
              required
            />
          </Field>
          <Field label="Имя">
            <Input
              value={character.name}
              onChange={(event) => onChange({ name: event.target.value })}
              placeholder="Шерлок Холмс"
              required
            />
          </Field>
        </div>
        <Field label="Краткое описание" className="mt-5">
          <Textarea
            value={character.description}
            onChange={(event) => onChange({ description: event.target.value })}
            className="min-h-24"
            placeholder="Кому и для какой практики подходит этот персонаж"
            required
          />
        </Field>
        <Field label="Описание персонажа для AI (промт)" className="mt-5">
          <Textarea
            value={character.character_prompt}
            onChange={(event) =>
              onChange({ character_prompt: event.target.value })
            }
            className="min-h-40"
            minLength={1}
            maxLength={2000}
            placeholder="Кто этот персонаж, какой у него характер и какие темы он обсуждает"
          />
        </Field>
        <p className="mt-3 text-xs leading-5 text-slate-500">
          Системный промт общий и уже задаёт язык, длину ответов и формат
          оценки. Здесь опишите, кто этот персонаж и какие у него характер и
          темы (до 2000 символов).
        </p>
        {editing && originallyHadPrompt && !character.character_prompt && (
          <p className="mt-3 text-xs leading-5 text-amber-700">
            Этот персонаж использует унаследованный промт. Пока поле пустое,
            промт не изменится; заполните его, чтобы перейти на общий промт
            (переход необратим из интерфейса).
          </p>
        )}
        <Field label="Первое приветствие" className="mt-5">
          <Textarea
            value={character.greeting}
            onChange={(event) => onChange({ greeting: event.target.value })}
            className="min-h-24"
            placeholder="Сообщение, которое пользователь увидит перед началом диалога"
            required
          />
        </Field>
        <div className="mt-5">
          <Checkbox
            label="Персонаж активен и доступен пользователям"
            checked={character.is_active}
            onChange={(is_active) => onChange({ is_active })}
          />
        </div>
      </Card>
    </div>
  );
}
