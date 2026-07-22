"use client";

import { AdminList, AdminListItem } from "@/components/admin/admin-list";
import { AdminMessage, AdminPage } from "@/components/admin/admin-page";
import { StatusBadge } from "@/components/content/status-badge";
import { Button } from "@/components/ui/button";
import { deleteCourse, listManagedCourses, publishCourse } from "@/lib/content/api";
import { useManagedList } from "@/lib/hooks/use-managed-list";

export default function AdminCoursesPage() {
  const list = useManagedList({ loadRequest: listManagedCourses, deleteRequest: deleteCourse, deleteConfirm: "Удалить курс вместе со всей структурой?", loadError: "Не удалось загрузить курсы", deleteError: "Не удалось удалить курс" });

  async function publish(id: string) {
    try {
      await publishCourse(id);
      await list.load();
      list.setMessage("Курс опубликован");
    } catch (error) {
      list.setMessage(error instanceof Error ? error.message : "Не удалось опубликовать курс");
    }
  }

  return (
    <AdminPage title="Курсы" description="Черновики, опубликованные и архивные программы." createHref="/admin/courses/new" createLabel="Новый курс">
      {list.message && <AdminMessage>{list.message}</AdminMessage>}
      <AdminList emptyLabel="Курсов пока нет.">
        {list.items.map((course) => <AdminListItem key={course.id} title={course.title} badge={<StatusBadge status={course.status} />} description={`/${course.slug} · ${course.sections_count} разделов · ${course.entries_count} материалов`} editHref={`/admin/courses/${course.id}`} onDelete={() => void list.remove(course.id)}>{course.status !== "published" && <Button variant="primary" className="bg-indigo-600 hover:bg-indigo-700" onClick={() => void publish(course.id)}>Опубликовать</Button>}</AdminListItem>)}
      </AdminList>
    </AdminPage>
  );
}
