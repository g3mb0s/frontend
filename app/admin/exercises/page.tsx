"use client";

import { AdminPage } from "@/components/admin/admin-page";
import { AdminList, AdminListItem, AdminSearch } from "@/components/admin/admin-list";
import { StatusBadge } from "@/components/content/status-badge";
import { deleteExercise, listManagedExercises } from "@/lib/content/api";
import { useManagedList } from "@/lib/hooks/use-managed-list";

export default function AdminExercisesPage() {
  const list = useManagedList({ loadRequest: listManagedExercises, deleteRequest: deleteExercise, deleteConfirm: "Удалить упражнение?" });

  return (
    <AdminPage title="Упражнения" createHref="/admin/exercises/new" createLabel="Новое упражнение">
      <AdminSearch value={list.search} onChange={list.setSearch} onSearch={() => void list.load()} />
      {list.message && <p className="mt-4 text-sm text-red-600">{list.message}</p>}
      <AdminList emptyLabel="Упражнений пока нет.">
        {list.items.map((exercise) => <AdminListItem key={exercise.id} title={exercise.title || "Без названия"} badge={<StatusBadge status={exercise.status} />} description={`${exercise.type} · ${exercise.level || "без уровня"} · ${exercise.language || "без языка"}`} editHref={`/admin/exercises/${exercise.id}`} onDelete={() => void list.remove(exercise.id)} />)}
      </AdminList>
    </AdminPage>
  );
}
