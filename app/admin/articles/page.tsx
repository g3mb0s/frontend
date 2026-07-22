"use client";

import { AdminPage } from "@/components/admin/admin-page";
import { AdminList, AdminListItem, AdminSearch } from "@/components/admin/admin-list";
import { StatusBadge } from "@/components/content/status-badge";
import { deleteArticle, listManagedArticles } from "@/lib/content/api";
import { useManagedList } from "@/lib/hooks/use-managed-list";

export default function AdminArticlesPage() {
  const list = useManagedList({ loadRequest: listManagedArticles, deleteRequest: deleteArticle, deleteConfirm: "Удалить статью?" });

  return (
    <AdminPage title="Статьи" createHref="/admin/articles/new" createLabel="Новая статья">
      <AdminSearch value={list.search} onChange={list.setSearch} onSearch={() => void list.load()} />
      {list.message && <p className="mt-4 text-sm text-red-600">{list.message}</p>}
      <AdminList emptyLabel="Статей пока нет.">
        {list.items.map((article) => <AdminListItem key={article.id} title={article.title} badge={<StatusBadge status={article.status} />} description={`${article.blocks.length} блоков · ${article.tags.join(", ") || "без тегов"}`} editHref={`/admin/articles/${article.id}`} onDelete={() => void list.remove(article.id)} />)}
      </AdminList>
    </AdminPage>
  );
}
