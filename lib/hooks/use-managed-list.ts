"use client";

import { useEffect, useState } from "react";

export function useManagedList<T>({ loadRequest, deleteRequest, deleteConfirm, loadError = "Ошибка загрузки", deleteError = "Ошибка удаления" }: { loadRequest: (query?: string) => Promise<T[]>; deleteRequest: (id: string) => Promise<unknown>; deleteConfirm: string; loadError?: string; deleteError?: string }) {
  const [items, setItems] = useState<T[]>([]);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void loadRequest().then((values) => { if (!cancelled) setItems(values); }).catch((error: Error) => { if (!cancelled) setMessage(error.message); });
    return () => { cancelled = true; };
  }, [loadRequest]);

  async function load(query = search) {
    try {
      setItems(await loadRequest(query));
      setMessage(null);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : loadError);
    }
  }

  async function remove(id: string) {
    if (!window.confirm(deleteConfirm)) return;
    try {
      await deleteRequest(id);
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : deleteError);
    }
  }

  return { items, search, message, setSearch, setMessage, load, remove };
}
