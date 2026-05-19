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

  const [search, setSearch] = useState("");

  const [filterStatus, setFilterStatus] = useState<
    "all" | "planning" | "shopping" | "completed"
  >("all");

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

  const filteredLists = lists.filter((list) => {
    const matchesSearch = list.title
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesStatus =
      filterStatus === "all" ? true : list.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  return (
    <AppLayout>
      <main className="min-h-screen bg-zinc-950 p-4 pb-32 text-white md:p-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <h1 className="text-4xl font-bold">Minhas Listas</h1>

            <p className="mt-2 text-zinc-400">
              Todas as suas listas de compras
            </p>
          </div>

          <div className="mb-8 space-y-4">
            <input
              type="text"
              placeholder="Buscar lista..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-5 py-4 outline-none transition focus:border-zinc-600"
            />

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setFilterStatus("all")}
                className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                  filterStatus === "all"
                    ? "bg-white text-black"
                    : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800"
                }`}
              >
                Todas
              </button>

              <button
                onClick={() => setFilterStatus("planning")}
                className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                  filterStatus === "planning"
                    ? "bg-white text-black"
                    : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800"
                }`}
              >
                🏠 Planejamento
              </button>

              <button
                onClick={() => setFilterStatus("shopping")}
                className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                  filterStatus === "shopping"
                    ? "bg-white text-black"
                    : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800"
                }`}
              >
                🛒 Comprando
              </button>

              <button
                onClick={() => setFilterStatus("completed")}
                className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                  filterStatus === "completed"
                    ? "bg-white text-black"
                    : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800"
                }`}
              >
                ✅ Finalizadas
              </button>
            </div>
          </div>

          {filteredLists.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-700 p-12 text-center">
              <p className="text-zinc-400">Nenhuma lista encontrada.</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {filteredLists.map((list) => (
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
