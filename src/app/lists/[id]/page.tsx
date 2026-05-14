"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "../../../lib/supabase/client";

interface Item {
  id: string;
  name: string;
  price: number | null;
  quantity: number;
  checked: boolean;
}

export default function ListPage() {
  const supabase = createClient();

  const params = useParams();
  const id = params.id as string;

  const [items, setItems] = useState<Item[]>([]);
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("1");

  const [loading, setLoading] = useState(false);

  const [listStatus, setListStatus] = useState<
    "planning" | "shopping" | "completed"
  >("planning");

  const [budget, setBudget] = useState(0);

  const [editingPrice, setEditingPrice] = useState<Record<string, string>>({});

  const fetchList = useCallback(async () => {
    const { data, error } = await supabase
      .from("shopping_lists")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error(error);
      return;
    }

    setListStatus(data.status);
    setBudget(Number(data.budget));
  }, [id, supabase]);

  const fetchItems = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("items")
        .select("*")
        .eq("list_id", id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error(error);
        return;
      }

      setItems(data || []);
    } catch (error) {
      console.error(error);
    }
  }, [id, supabase]);

  async function createItem() {
    try {
      setLoading(true);

      if (!name || !quantity) {
        alert("Preencha todos os campos");
        return;
      }

      const { error } = await supabase.from("items").insert({
        list_id: id,
        name,
        quantity: Number(quantity),
      });

      if (error) {
        console.error(error);
        alert(error.message);
        return;
      }

      setName("");
      setQuantity("1");

      await fetchItems();
    } catch (error) {
      console.error(error);
      alert("Erro inesperado");
    } finally {
      setLoading(false);
    }
  }

  async function updatePrice(itemId: string, price: number) {
    const { error } = await supabase
      .from("items")
      .update({
        price,
        checked: true,
      })
      .eq("id", itemId);

    if (error) {
      console.error(error);
      return;
    }

    fetchItems();
  }

  async function toggleChecked(itemId: string, checked: boolean) {
    const { error } = await supabase
      .from("items")
      .update({
        checked: !checked,
      })
      .eq("id", itemId);

    if (error) {
      console.error(error);
      return;
    }

    fetchItems();
  }

  async function startShopping() {
    const { error } = await supabase
      .from("shopping_lists")
      .update({
        status: "shopping",
      })
      .eq("id", id);

    if (error) {
      alert("Erro ao iniciar compra");
      return;
    }

    setListStatus("shopping");
  }

  useEffect(() => {
    queueMicrotask(() => {
      fetchItems();
      fetchList();
    });
  }, [fetchItems, fetchList]);

  const total = items.reduce((acc, item) => {
    return acc + (item.price || 0) * item.quantity;
  }, 0);

  const remaining = budget - total;

  const percentage = budget > 0 ? Math.min((total / budget) * 100, 100) : 0;

  return (
    <main className="min-h-screen bg-zinc-950 p-6 text-white">
      <div className="mx-auto max-w-5xl">
        <div className="mb-4">
          <span className="rounded-full bg-zinc-800 px-4 py-2 text-sm text-zinc-300">
            {listStatus === "planning" && "🏠 Modo Casa"}
            {listStatus === "shopping" && "🛒 Modo Mercado"}
            {listStatus === "completed" && "✅ Finalizada"}
          </span>
        </div>

        <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-4xl font-bold">Minha Lista</h1>

            <p className="mt-2 text-zinc-400">
              Controle inteligente das compras
            </p>
          </div>

          <div className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-zinc-400">Orçamento</p>

              <p className="text-sm text-zinc-400">{percentage.toFixed(0)}%</p>
            </div>

            <div className="mt-3 h-3 overflow-hidden rounded-full bg-zinc-800">
              <div
                style={{
                  width: `${percentage}%`,
                }}
                className={`h-full transition-all ${
                  percentage >= 100
                    ? "bg-red-500"
                    : percentage >= 80
                      ? "bg-yellow-500"
                      : "bg-green-500"
                }`}
              />
            </div>

            <div className="mt-5 flex items-end justify-between">
              <div>
                <p className="text-sm text-zinc-400">Total</p>

                <h2 className="text-3xl font-bold text-white">
                  R$ {total.toFixed(2)}
                </h2>
              </div>

              <div className="text-right">
                <p className="text-sm text-zinc-400">Restante</p>

                <h2
                  className={`text-2xl font-bold ${
                    remaining < 0 ? "text-red-400" : "text-green-400"
                  }`}
                >
                  R$ {remaining.toFixed(2)}
                </h2>
              </div>
            </div>
          </div>
        </div>

        {listStatus === "planning" && (
          <>
            <div className="mb-6">
              <button
                onClick={startShopping}
                className="rounded-xl bg-green-500 px-6 py-3 font-semibold text-black transition hover:opacity-90"
              >
                Iniciar compra
              </button>
            </div>

            <div className="mb-8 rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
              <h2 className="mb-6 text-2xl font-bold">Adicionar item</h2>

              <div className="grid gap-4 md:grid-cols-3">
                <input
                  type="text"
                  placeholder="Nome do item"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 outline-none transition focus:border-zinc-500"
                />

                <input
                  type="number"
                  placeholder="Quantidade"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 outline-none transition focus:border-zinc-500"
                />

                <button
                  onClick={createItem}
                  disabled={loading}
                  className="rounded-xl bg-white px-4 py-3 font-semibold text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? "Adicionando..." : "Adicionar"}
                </button>
              </div>
            </div>
          </>
        )}

        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-700 p-12 text-center">
            <p className="text-zinc-400">Nenhum item adicionado ainda.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className={`rounded-2xl border border-zinc-800 bg-zinc-900 p-6 transition ${
                  item.checked ? "opacity-60" : ""
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={() => toggleChecked(item.id, item.checked)}
                      className="h-5 w-5"
                    />

                    <div>
                      <h2
                        className={`text-2xl font-bold ${
                          item.checked ? "line-through text-zinc-500" : ""
                        }`}
                      >
                        {item.name}
                      </h2>

                      <p className="mt-1 text-zinc-400">
                        Quantidade: {item.quantity}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    {item.price ? (
                      <>
                        <p className="text-zinc-400">Subtotal</p>

                        <h2 className="text-3xl font-bold text-green-400">
                          R$ {(item.price * item.quantity).toFixed(2)}
                        </h2>
                      </>
                    ) : listStatus === "shopping" ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          placeholder="Preço"
                          value={editingPrice[item.id] || ""}
                          onChange={(e) =>
                            setEditingPrice({
                              ...editingPrice,
                              [item.id]: e.target.value,
                            })
                          }
                          className="w-24 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm outline-none"
                        />

                        <button
                          onClick={() => {
                            const value = editingPrice[item.id];

                            if (!value) return;

                            updatePrice(item.id, Number(value));

                            setEditingPrice({
                              ...editingPrice,
                              [item.id]: "",
                            });
                          }}
                          className="rounded-lg bg-green-500 px-4 py-2 font-semibold text-black transition hover:opacity-90"
                        >
                          OK
                        </button>
                      </div>
                    ) : (
                      <p className="text-zinc-500">Sem preço</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {listStatus === "shopping" && (
        <div className="fixed bottom-0 left-0 right-0 border-t border-zinc-800 bg-zinc-900 p-4 backdrop-blur">
          <div className="mx-auto flex max-w-5xl items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">Total Atual</p>

              <h2 className="text-2xl font-bold text-white">
                R$ {total.toFixed(2)}
              </h2>
            </div>

            <div className="text-right">
              <p className="text-sm text-zinc-400">Restante</p>

              <h2
                className={`text-2xl font-bold ${
                  remaining < 0 ? "text-red-400" : "text-green-400"
                }`}
              >
                R$ {remaining.toFixed(2)}
              </h2>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
