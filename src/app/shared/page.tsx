"use client";

import { useCallback, useEffect, useState } from "react";

import AppLayout from "../../components/AppLayout";

import ListCard from "../../components/lists/ListCard";
import { createClient } from "../../lib/supabase/client";

interface SharedList {
  shopping_lists: {
    id: string;
    title: string;
    budget: number;
    profiles?: {
      full_name: string | null;
    } | null;
  };
}

export default function SharedPage() {
  const supabase = createClient();

  const [lists, setLists] = useState<SharedList[]>([]);

  const fetchLists = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data, error } = await supabase
      .from("list_members")
      .select(
        `
        shopping_lists (
          id,
          title,
          budget,
          owner_id
        )
      `,
      )
      .eq("user_id", user.id);

    if (error) {
      console.error(error);

      return;
    }

    const formatted =
      data?.map((item) => ({
        shopping_lists: Array.isArray(item.shopping_lists)
          ? item.shopping_lists[0]
          : item.shopping_lists,
      })) || [];

    setLists(formatted);
  }, [supabase]);

  useEffect(() => {
    queueMicrotask(() => {
      fetchLists();
    });
  }, [fetchLists]);

  return (
    <AppLayout>
      <main className="min-h-screen bg-zinc-950 p-4 pb-32 text-white md:p-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <h1 className="text-4xl font-bold">Compartilhadas</h1>

            <p className="mt-2 text-zinc-400">Listas compartilhadas com você</p>
          </div>

          {lists.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-700 p-12 text-center">
              <p className="text-zinc-400">
                Nenhuma lista compartilhada encontrada.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {lists.map((item) => (
                <ListCard
                  key={item.shopping_lists.id}
                  id={item.shopping_lists.id}
                  title={item.shopping_lists.title}
                  budget={item.shopping_lists.budget}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </AppLayout>
  );
}
