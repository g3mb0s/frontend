"use client";

import { AdminList, AdminListItem, AdminSearch } from "@/components/admin/admin-list";
import { AdminPage } from "@/components/admin/admin-page";
import { deleteCharacter, listManagedCharacters } from "@/lib/characters/api";
import { useManagedList } from "@/lib/hooks/use-managed-list";

export default function AdminCharactersPage() {
  const list = useManagedList({
    loadRequest: listManagedCharacters,
    deleteRequest: deleteCharacter,
    deleteConfirm: "Удалить персонажа?",
    loadError: "Не удалось загрузить персонажей",
    deleteError: "Не удалось удалить персонажа",
  });

  return (
    <AdminPage
      title="AI-персонажи"
      description="Настройте доступных собеседников. Системный промт общий — вы задаёте только короткое описание персонажа."
      createHref="/admin/characters/new"
      createLabel="Новый персонаж"
      adminOnly
    >
      <AdminSearch
        value={list.search}
        onChange={list.setSearch}
        onSearch={() => void list.load()}
      />
      {list.message && <p className="mt-4 text-sm text-red-600">{list.message}</p>}
      <AdminList emptyLabel="Персонажей пока нет.">
        {list.items.map((character) => (
          <AdminListItem
            key={character.id}
            title={character.name}
            badge={
              <span className={`rounded-full px-2 py-1 text-xs font-medium ${character.is_active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                {character.is_active ? "Активен" : "Скрыт"}
              </span>
            }
            description={`${character.id} · ${character.description}`}
            editHref={`/admin/characters/${character.id}`}
            onDelete={() => void list.remove(character.id)}
          />
        ))}
      </AdminList>
    </AdminPage>
  );
}
