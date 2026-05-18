"use client";

import { useCallback, useEffect, useState } from "react";

import AppLayout from "../../components/AppLayout";

import ListCard from "../../components/lists/ListCard";

import { createClient } from "../../lib/supabase/client";

interface ShoppingList {
  id: string;

  title: string;

  budget: number;

  status: "planning" | "shopping" | "completed";
}

export default function ListsPage() {
  const supabase = createClient();

  const [lists, setLists] = useState<ShoppingList[]>([]);

  const fetchLists = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data, error } = await supabase
      .from("shopping_lists")
      .select("*")
      .eq("owner_id", user.id)
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error(error);

      return;
    }

    setLists(data || []);
  }, [supabase]);

  useEffect(() => {
    queueMicrotask(() => {
      fetchLists();
    });
  }, [fetchLists]);

  return (
    <AppLayout>
      <main className="min-h-screen bg-zinc-950 p-4 text-white md:p-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <h1 className="text-4xl font-bold">Minhas Listas</h1>

            <p className="mt-2 text-zinc-400">
              Todas as suas listas de compras
            </p>
          </div>

          {lists.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-700 p-12 text-center">
              <p className="text-zinc-400">Nenhuma lista encontrada.</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {lists.map((list) => (
                <ListCard
                  key={list.id}
                  id={list.id}
                  title={list.title}
                  budget={list.budget}
                  status={list.status}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </AppLayout>
  );
}
