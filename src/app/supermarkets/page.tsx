"use client";

import { useCallback, useEffect, useState } from "react";

import AppLayout from "../../components/AppLayout";

import { createClient } from "../../lib/supabase/client";

interface Supermarket {
  id: string;
  name: string;
  city: string | null;
}

export default function SupermarketsPage() {
  const supabase = createClient();

  const [markets, setMarkets] = useState<Supermarket[]>([]);

  const [name, setName] = useState("");

  const [city, setCity] = useState("");

  const [loading, setLoading] = useState(false);

  const fetchMarkets = useCallback(async () => {
    const { data, error } = await supabase
      .from("supermarkets")
      .select("*")
      .order("name");

    if (error) {
      console.error(error);
      return;
    }

    setMarkets(data || []);
  }, [supabase]);

  async function createMarket() {
    try {
      setLoading(true);

      if (!name) {
        alert("Digite o nome do supermercado");
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        alert("Usuário não autenticado");
        return;
      }

      const { error } = await supabase.from("supermarkets").insert({
        name,
        city,
        user_id: user.id,
      } as never);

      if (error) {
        console.error(error);

        alert(error.message);

        return;
      }

      setName("");

      setCity("");

      fetchMarkets();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function deleteMarket(id: string) {
    const confirmed = confirm("Deseja realmente excluir este supermercado?");

    if (!confirmed) return;

    const { error } = await supabase.from("supermarkets").delete().eq("id", id);

    if (error) {
      console.error(error);

      alert("Erro ao excluir supermercado");

      return;
    }

    fetchMarkets();
  }

  useEffect(() => {
    queueMicrotask(() => {
      fetchMarkets();
    });
  }, [fetchMarkets]);

  return (
    <AppLayout>
      <main className="min-h-screen bg-zinc-950 p-4 text-white md:p-6">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8">
            <h1 className="text-4xl font-bold">Supermercados</h1>

            <p className="mt-2 text-zinc-400">
              Gerencie os mercados disponíveis
            </p>
          </div>

          <div className="mb-8 rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <h2 className="mb-6 text-2xl font-bold">Novo supermercado</h2>

            <div className="grid gap-4 md:grid-cols-3">
              <input
                type="text"
                placeholder="Nome do mercado"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-4 outline-none"
              />

              <input
                type="text"
                placeholder="Cidade"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-4 outline-none"
              />

              <button
                onClick={createMarket}
                disabled={loading}
                className="rounded-xl bg-white px-4 py-4 font-semibold text-black transition hover:opacity-90 disabled:opacity-50"
              >
                {loading ? "Salvando..." : "Cadastrar"}
              </button>
            </div>
          </div>

          {markets.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-700 p-12 text-center">
              <p className="text-zinc-400">Nenhum supermercado cadastrado.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {markets.map((market) => (
                <div
                  key={market.id}
                  className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-bold">{market.name}</h2>

                      <p className="mt-2 text-zinc-400">
                        {market.city || "Cidade não informada"}
                      </p>
                    </div>

                    <button
                      onClick={() => deleteMarket(market.id)}
                      className="rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </AppLayout>
  );
}
