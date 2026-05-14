"use client";

import AppLayout from "../../components/AppLayout";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { createClient } from "../../lib/supabase/client";

interface ShoppingList {
  id: string;
  title: string;
  budget: number;
  owner_id: string;
}

interface MemberListResponse {
  shopping_lists: ShoppingList;
}

export default function DashboardPage() {
  const supabase = createClient();

  const [lists, setLists] = useState<ShoppingList[]>([]);

  const [title, setTitle] = useState("");
  const [budget, setBudget] = useState("");

  const [loading, setLoading] = useState(false);

  const fetchLists = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data: ownLists } = await supabase
      .from("shopping_lists")
      .select("*")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false });

    const { data: memberLists } = await supabase
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

    const formattedMemberLists =
      (memberLists as MemberListResponse[] | null)?.map(
        (item) => item.shopping_lists,
      ) || [];

    const allLists = [...(ownLists || []), ...formattedMemberLists];

    const uniqueLists = allLists.filter(
      (list, index, self) => index === self.findIndex((l) => l.id === list.id),
    );

    setLists(uniqueLists);
  }, [supabase]);

  async function createList() {
    try {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      if (!title || !budget) {
        alert("Preencha todos os campos");
        return;
      }

      const { error } = await supabase.from("shopping_lists").insert({
        title,
        budget: Number(budget),
        owner_id: user.id,
      });

      if (error) {
        console.error(error);
        alert(error.message);
        return;
      }

      setTitle("");
      setBudget("");

      fetchLists();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    queueMicrotask(() => {
      fetchLists();
    });
  }, [fetchLists]);

  return (
    <AppLayout>
      <main className="min-h-screen bg-zinc-950 p-6 text-white">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <h1 className="text-4xl font-bold">Dashboard</h1>

            <p className="mt-2 text-zinc-400">
              Gerencie suas listas de compras
            </p>
          </div>

          <div className="mb-8 rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <h2 className="mb-4 text-2xl font-bold">Nova lista</h2>

            <div className="grid gap-4 md:grid-cols-3">
              <input
                type="text"
                placeholder="Nome da lista"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 outline-none"
              />

              <input
                type="number"
                placeholder="Orçamento"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 outline-none"
              />

              <button
                onClick={createList}
                disabled={loading}
                className="rounded-xl bg-white px-4 py-3 font-semibold text-black transition hover:opacity-90 disabled:opacity-50"
              >
                {loading ? "Criando..." : "Criar lista"}
              </button>
            </div>
          </div>

          {lists.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-700 p-12 text-center">
              <p className="text-zinc-400">Nenhuma lista encontrada.</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-3">
              {lists.map((list) => (
                <Link href={`/lists/${list.id}`} key={list.id}>
                  <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 transition hover:border-zinc-600 hover:bg-zinc-800">
                    <div className="mb-4 flex items-center justify-between">
                      <span className="rounded-full bg-zinc-800 px-3 py-1 text-xs text-zinc-300">
                        Lista
                      </span>
                    </div>

                    <h2 className="text-2xl font-bold">{list.title}</h2>

                    <div className="mt-6">
                      <p className="text-sm text-zinc-400">Orçamento</p>

                      <p className="mt-1 text-3xl font-bold text-green-400">
                        R$ {Number(list.budget).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </AppLayout>
  );
}
