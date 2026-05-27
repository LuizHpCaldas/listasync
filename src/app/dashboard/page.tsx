"use client";

import Link from "next/link";

import { useCallback, useEffect, useMemo, useState } from "react";

import AppLayout from "../../components/AppLayout";

import { createClient } from "../../lib/supabase/client";

import AnalyticsChart from "../../components/dashboard/AnalyticsChart";

import { checkPremium } from "../../lib/checkPremium";

interface ShoppingList {
  id: string;

  title: string;

  budget: number;

  owner_id: string;

  status: "planning" | "shopping" | "completed";

  completed_at?: string | null;
}

interface MemberListResponse {
  shopping_lists: {
    id: string;
    title: string;
    budget: number | null;
    owner_id: string | null;
    status: string | null;
  };
}

export default function DashboardPage() {
  const supabase = createClient();

  const [lists, setLists] = useState<ShoppingList[]>([]);

  const [title, setTitle] = useState("");

  const [budget, setBudget] = useState("");

  const [loading, setLoading] = useState(false);

  const [isPremium, setIsPremium] = useState(false);

  const fetchLists = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const premium = await checkPremium();

    setIsPremium(premium);

    const { data: ownLists } = await supabase
      .from("shopping_lists")
      .select("*")
      .eq("owner_id", user.id)
      .order("created_at", {
        ascending: false,
      });

    const { data: memberLists } = await supabase
      .from("list_members")
      .select(
        `
        shopping_lists (
          id,
          title,
          budget,
          owner_id,
          status
        )
      `,
      )
      .eq("user_id", user.id);

    const formattedMemberLists =
      (memberLists as MemberListResponse[])?.map(
        (item) => item.shopping_lists,
      ) || [];

    const allLists = [...(ownLists || []), ...formattedMemberLists];

    const normalizedLists: ShoppingList[] = allLists.map((list) => ({
      id: list.id,
      title: list.title ?? "Sem título",
      budget: Number(list.budget ?? 0),
      owner_id: list.owner_id ?? "",
      status: (list.status ?? "planning") as
        | "planning"
        | "shopping"
        | "completed",
    }));

    const uniqueLists = normalizedLists.filter(
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
        status: "planning",
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

  const stats = useMemo(() => {
    const planning = lists.filter((list) => list.status === "planning").length;

    const shopping = lists.filter((list) => list.status === "shopping").length;

    const completed = lists.filter(
      (list) => list.status === "completed",
    ).length;

    const totalBudget = lists.reduce(
      (acc, list) => acc + Number(list.budget || 0),
      0,
    );

    const currentMonth = new Date().getMonth();

    const monthlyLists = lists.filter((list) => {
      if (!list.completed_at) return false;

      const date = new Date(list.completed_at);

      return date.getMonth() === currentMonth;
    });

    const monthlySpent = monthlyLists.reduce(
      (acc, list) => acc + Number(list.budget || 0),
      0,
    );

    const averagePerList = completed > 0 ? totalBudget / completed : 0;

    return {
      total: lists.length,
      planning,
      shopping,
      completed,
      totalBudget,
      monthlySpent,
      averagePerList,
    };
  }, [lists]);

  return (
    <AppLayout>
      <main className="min-h-screen bg-zinc-950 p-4 pb-32 text-white md:p-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <h1 className="text-4xl font-bold">Dashboard</h1>

            <p className="mt-2 text-zinc-400">
              Gerencie suas listas de compras
            </p>
          </div>

          <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-8">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
              <p className="text-sm text-zinc-400">Total de listas</p>

              <h2 className="mt-3 text-3xl font-bold">{stats.total}</h2>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
              <p className="text-sm text-zinc-400">Planejamento</p>

              <h2 className="mt-3 text-3xl font-bold text-blue-400">
                {stats.planning}
              </h2>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
              <p className="text-sm text-zinc-400">Comprando</p>

              <h2 className="mt-3 text-3xl font-bold text-yellow-400">
                {stats.shopping}
              </h2>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
              <p className="text-sm text-zinc-400">Finalizadas</p>

              <h2 className="mt-3 text-3xl font-bold text-green-400">
                {stats.completed}
              </h2>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
              <p className="text-sm text-zinc-400">Orçamento total</p>

              <h2 className="mt-3 text-2xl font-bold text-green-400">
                R$ {stats.totalBudget.toFixed(2)}
              </h2>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
              <p className="text-sm text-zinc-400">Gasto no mês</p>

              <h2 className="mt-3 text-2xl font-bold text-yellow-400">
                R$ {stats.monthlySpent.toFixed(2)}
              </h2>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
              <p className="text-sm text-zinc-400">Média por compra</p>

              <h2 className="mt-3 text-2xl font-bold text-blue-400">
                R$ {stats.averagePerList.toFixed(2)}
              </h2>
            </div>

            <div
              className={`rounded-2xl border p-5 ${
                isPremium
                  ? "border-yellow-500 bg-yellow-500/10"
                  : "border-zinc-800 bg-zinc-900"
              }`}
            >
              <p className="text-sm text-zinc-400">Plano</p>

              <h2 className="mt-3 text-2xl font-bold">
                {isPremium ? "⭐ Premium" : "Free"}
              </h2>

              {!isPremium && (
                <Link
                  href="/premium"
                  className="mt-4 inline-block rounded-xl bg-yellow-500 px-4 py-2 font-semibold text-black transition hover:opacity-90"
                >
                  Fazer upgrade
                </Link>
              )}
            </div>
          </div>

          <div className="mb-8 rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold">Nova lista</h2>

              {!isPremium && (
                <span className="rounded-full bg-yellow-500/20 px-3 py-1 text-xs font-semibold text-yellow-400">
                  FREE
                </span>
              )}
            </div>

            {!isPremium && (
              <div className="mb-5 rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-4">
                <p className="text-sm text-zinc-300">
                  O plano gratuito permite criar listas normalmente.
                </p>

                <p className="mt-2 text-sm text-zinc-400">Recursos premium:</p>

                <ul className="mt-2 space-y-1 text-sm text-zinc-300">
                  <li>⭐ Compartilhar listas</li>

                  <li>⭐ Compras colaborativas</li>

                  <li>⭐ Relatórios inteligentes com IA</li>

                  <li>⭐ Recursos avançados futuros</li>
                </ul>

                <Link
                  href="/premium"
                  className="mt-4 inline-block rounded-xl bg-yellow-500 px-5 py-3 font-semibold text-black transition hover:opacity-90"
                >
                  Assinar Premium
                </Link>
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-3">
              <input
                type="text"
                placeholder="Nome da lista"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-4 outline-none transition focus:border-zinc-500"
              />

              <input
                type="number"
                placeholder="Orçamento"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-4 outline-none transition focus:border-zinc-500"
              />

              <button
                onClick={createList}
                disabled={loading}
                className="rounded-xl bg-white px-4 py-4 font-semibold text-black transition hover:opacity-90 disabled:opacity-50"
              >
                {loading ? "Criando..." : "Criar lista"}
              </button>
            </div>
          </div>

          <div className="mb-8">
            <AnalyticsChart
              planning={stats.planning}
              shopping={stats.shopping}
              completed={stats.completed}
            />
          </div>

          {lists.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-700 p-12 text-center">
              <p className="text-zinc-400">Nenhuma lista encontrada.</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {lists.map((list) => (
                <Link href={`/lists/${list.id}`} key={list.id}>
                  <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 transition hover:border-zinc-600 hover:bg-zinc-800">
                    <div className="mb-5 flex items-center justify-between">
                      <span
                        className={`rounded-full px-3 py-1 text-xs ${
                          list.status === "planning"
                            ? "bg-blue-500/20 text-blue-400"
                            : list.status === "shopping"
                              ? "bg-yellow-500/20 text-yellow-400"
                              : "bg-green-500/20 text-green-400"
                        }`}
                      >
                        {list.status === "planning" && "🏠 Planejamento"}

                        {list.status === "shopping" && "🛒 Comprando"}

                        {list.status === "completed" && "✅ Finalizada"}
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
