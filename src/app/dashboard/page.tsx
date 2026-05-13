"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "../../lib/supabase/client";
import { ShoppingList } from "../../types/list";

export default function DashboardPage() {
  const supabase = createClient();

  const [lists, setLists] = useState<ShoppingList[]>([]);
  const [title, setTitle] = useState("");
  const [budget, setBudget] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchLists = useCallback(async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data, error } = await supabase
        .from("shopping_lists")
        .select("*")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error(error);
        return;
      }

      setLists(data || []);
    } catch (error) {
      console.error(error);
    }
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
        alert("Erro ao criar lista");
        return;
      }

      setTitle("");
      setBudget("");

      await fetchLists();
    } catch (error) {
      console.error(error);
      alert("Erro inesperado");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const loadData = async () => {
      await fetchLists();
    };

    loadData();
  }, [fetchLists]);

  return (
    <main className="min-h-screen bg-zinc-950 p-6 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-4xl font-bold">Dashboard</h1>

            <p className="mt-2 text-zinc-400">
              Gerencie suas listas de compras
            </p>
          </div>

          <button className="rounded-xl border border-zinc-700 px-5 py-3 transition hover:bg-zinc-800">
            Compartilhar lista
          </button>
        </div>

        <div className="mb-10 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <p className="text-zinc-400">Total de listas</p>

            <h2 className="mt-3 text-4xl font-bold">{lists.length}</h2>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <p className="text-zinc-400">Orçamento total</p>

            <h2 className="mt-3 text-4xl font-bold text-green-400">
              R${" "}
              {lists
                .reduce((acc, list) => acc + Number(list.budget), 0)
                .toFixed(2)}
            </h2>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <p className="text-zinc-400">Economia estimada</p>

            <h2 className="mt-3 text-4xl font-bold text-emerald-400">
              R$ 0,00
            </h2>
          </div>
        </div>

        <div className="mb-10 rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="mb-6 text-2xl font-bold">Nova lista</h2>

          <div className="grid gap-4 md:grid-cols-3">
            <input
              type="text"
              placeholder="Nome da lista"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 outline-none transition focus:border-zinc-500"
            />

            <input
              type="number"
              placeholder="Orçamento"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 outline-none transition focus:border-zinc-500"
            />

            <button
              onClick={createList}
              disabled={loading}
              className="rounded-xl bg-white px-4 py-3 font-semibold text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Criando..." : "Criar lista"}
            </button>
          </div>
        </div>

        <div>
          <h2 className="mb-6 text-2xl font-bold">Suas listas</h2>

          {lists.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-700 p-12 text-center">
              <p className="text-zinc-400">Nenhuma lista criada ainda.</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-3">
              {lists.map((list) => (
                <div
                  key={list.id}
                  className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 transition hover:border-zinc-700"
                >
                  <div className="mb-6 flex items-start justify-between">
                    <div>
                      <h3 className="text-2xl font-bold">{list.title}</h3>

                      <p className="mt-2 text-zinc-400">Orçamento</p>
                    </div>

                    <div className="rounded-full bg-green-500/10 px-3 py-1 text-sm font-medium text-green-400">
                      Ativa
                    </div>
                  </div>

                  <p className="text-4xl font-bold text-green-400">
                    R$ {Number(list.budget).toFixed(2)}
                  </p>

                  <button className="mt-6 w-full rounded-xl border border-zinc-700 px-4 py-3 transition hover:bg-zinc-800">
                    Abrir lista
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
