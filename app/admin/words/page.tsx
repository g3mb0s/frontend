"use client";

import { AdminPage } from "@/components/admin/admin-page";
import { AdminList, AdminListItem, AdminSearch } from "@/components/admin/admin-list";
import { StatusBadge } from "@/components/content/status-badge";
import { deleteWord, listManagedWords } from "@/lib/content/api";
import { useManagedList } from "@/lib/hooks/use-managed-list";

export default function AdminWordsPage() {
  const list = useManagedList({ loadRequest: listManagedWords, deleteRequest: deleteWord, deleteConfirm: "Удалить слово?" });

  return (
    <AdminPage title="Слова" createHref="/admin/words/new" createLabel="Новое слово">
      <AdminSearch value={list.search} onChange={list.setSearch} onSearch={() => void list.load()} />
      {list.message && <p className="mt-4 text-sm text-red-600">{list.message}</p>}
      <AdminList emptyLabel="Слов пока нет.">
        {list.items.map((word) => (
          <AdminListItem
            key={word.id}
            title={word.word}
            badge={<StatusBadge status={word.status} />}
            description={`${word.translation} · ${word.categories.map((category) => category.slug).join(", ") || "без категорий"}`}
            editHref={`/admin/words/${word.id}`}
            onDelete={() => void list.remove(word.id)}
          />
        ))}
      </AdminList>
    </AdminPage>
  );
}
