"use client";

import { useCallback, useEffect, useState } from "react";

import { useParams, useRouter } from "next/navigation";

import AppLayout from "../../../components/AppLayout";

import { createClient } from "../../../lib/supabase/client";

import { Supermarket } from "../../../types/supermarket";
import { toast } from "sonner";
import ListCard from "../../../components/lists/ItemCard";
import { checkPremium } from "../../../lib/checkPremium";
import { canShareLists } from "../../../lib/premiumGate";

interface Item {
  id: string;
  name: string;
  price: number | null;
  quantity: number;
  checked: boolean;
}

export default function ListPage() {
  const supabase = createClient();

  const router = useRouter();

  const params = useParams();

  const id = params.id as string;

  const [items, setItems] = useState<Item[]>([]);

  const [name, setName] = useState("");

  const [quantity, setQuantity] = useState("1");

  const [loading, setLoading] = useState(false);

  const [deleting, setDeleting] = useState(false);

  const [listStatus, setListStatus] = useState<
    "planning" | "shopping" | "completed"
  >("planning");

  const [budget, setBudget] = useState(0);

  const [editingPrice, setEditingPrice] = useState<Record<string, string>>({});

  const [editingItem, setEditingItem] = useState<string | null>(null);

  const [editingName, setEditingName] = useState("");

  const [editingQuantity, setEditingQuantity] = useState("1");

  const [shareEmail, setShareEmail] = useState("");

  const [sharing, setSharing] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [supermarkets, setSupermarkets] = useState<Supermarket[]>([]);

  const [selectedSupermarket, setSelectedSupermarket] = useState("");

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

    setListStatus(
      (data.status as "planning" | "shopping" | "completed") ?? "planning",
    );

    setBudget(Number(data.budget));

    if (data.supermarket_id) {
      setSelectedSupermarket(data.supermarket_id);
    }
  }, [id, supabase]);

  const fetchItems = useCallback(async () => {
    const { data, error } = await supabase
      .from("items")
      .select("*")
      .eq("list_id", id)
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error(error);
      return;
    }

    setItems(
      (data || []).map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity ?? 1,
        checked: item.checked ?? false,
      })),
    );
  }, [id, supabase]);

  const fetchSupermarkets = useCallback(async () => {
    const { data, error } = await supabase
      .from("supermarkets")
      .select("*")
      .order("name");

    if (error) {
      console.error(error);
      return;
    }

    setSupermarkets(data || []);
  }, [supabase]);

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

      fetchItems();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function deleteList() {
    const confirmed = confirm("Deseja realmente excluir esta lista?");

    if (!confirmed) return;

    try {
      setDeleting(true);

      await supabase.from("items").delete().eq("list_id", id);

      await supabase.from("list_members").delete().eq("list_id", id);

      const { error } = await supabase
        .from("shopping_lists")
        .delete()
        .eq("id", id);

      if (error) {
        console.error(error);

        toast.error("Erro ao excluir lista");

        return;
      }

      toast.success("Lista excluída!");

      router.push("/dashboard");
    } catch (error) {
      console.error(error);
    } finally {
      setDeleting(false);
    }
  }

  async function shareList() {
    try {
      const premium = await checkPremium();

      if (!premium) {
        toast.error("Disponível apenas para Premium");
        return;
      }
      setSharing(true);

      if (!shareEmail) {
        alert("Digite um email");
        return;
      }

      const { data: userId, error: userError } = await supabase.rpc(
        "get_user_id_by_email",
        {
          user_email: shareEmail,
        },
      );

      if (userError || !userId) {
        alert("Usuário não encontrado");
        return;
      }

      const { error } = await supabase.from("list_members").insert({
        list_id: id,
        user_id: userId,
      });

      if (error) {
        console.error(error);

        alert(error.message);

        return;
      }

      setShareEmail("");

      alert("Lista compartilhada!");
    } catch (error) {
      console.error(error);
    } finally {
      setSharing(false);
    }
  }

  async function saveSupermarket() {
    if (!selectedSupermarket) {
      toast.error("Selecione um supermercado");
      return;
    }

    const { error } = await supabase
      .from("shopping_lists")
      .update({
        supermarket_id: selectedSupermarket,
      })
      .eq("id", id);

    if (error) {
      console.error(error);

      toast.error("Erro ao salvar mercado");

      return;
    }

    toast.success("Supermercado salvo!");
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
    }

    fetchItems();
  }
  async function deleteItem(itemId: string) {
    const confirmed = confirm("Deseja remover este item?");

    if (!confirmed) return;

    const { error } = await supabase.from("items").delete().eq("id", itemId);

    if (error) {
      console.error(error);

      toast.error("Erro ao remover item");

      return;
    }

    toast.success("Item removido!");

    fetchItems();
  }

  async function updateItem(itemId: string) {
    const { error } = await supabase
      .from("items")
      .update({
        name: editingName,
        quantity: Number(editingQuantity),
      })
      .eq("id", itemId);

    if (error) {
      console.error(error);

      toast.error("Erro ao atualizar item");

      return;
    }

    toast.success("Item atualizado!");

    setEditingItem(null);

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
      toast.error("Erro ao iniciar compra");

      return;
    }

    setListStatus("shopping");
  }

  async function finishShopping() {
    const confirmed = confirm("Deseja finalizar esta compra?");

    if (!confirmed) return;

    const { error } = await supabase
      .from("shopping_lists")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      console.error(error);

      toast.error("Erro ao finalizar compra");

      return;
    }

    setListStatus("completed");

    toast.success("Compra finalizada!");
  }

  useEffect(() => {
    queueMicrotask(() => {
      fetchItems();

      fetchList();

      fetchSupermarkets();

      canShareLists().then(setIsPremium);
    });

    const channel = supabase
      .channel(`items-${id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "items",
          filter: `list_id=eq.${id}`,
        },
        () => {
          fetchItems();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchItems, fetchList, fetchSupermarkets, id, supabase]);

  const total = items.reduce((acc, item) => {
    return acc + (item.price || 0) * item.quantity;
  }, 0);

  const remaining = budget - total;

  const percentage = budget > 0 ? Math.min((total / budget) * 100, 100) : 0;

  return (
    <AppLayout>
      <main className="min-h-screen overflow-x-hidden bg-zinc-950 pb-32 text-white">
        <div className="mx-auto max-w-5xl p-4 md:p-6">
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <span className="inline-flex rounded-full bg-zinc-800 px-4 py-2 text-sm text-zinc-300">
                {listStatus === "planning" && "🏠 Modo Casa"}

                {listStatus === "shopping" && "🛒 Modo Mercado"}

                {listStatus === "completed" && "✅ Finalizada"}
              </span>

              <h1 className="mt-4 text-3xl font-bold md:text-5xl">
                Minha Lista
              </h1>

              <p className="mt-2 text-zinc-400">
                Controle inteligente das compras
              </p>
            </div>

            <div className="w-full md:w-80">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-zinc-400">Orçamento</p>

                  <p className="text-sm text-zinc-400">
                    {percentage.toFixed(0)}%
                  </p>
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

                    <h2 className="text-2xl font-bold md:text-3xl">
                      R$ {total.toFixed(2)}
                    </h2>
                  </div>

                  <div className="text-right">
                    <p className="text-sm text-zinc-400">Restante</p>

                    <h2
                      className={`text-xl font-bold md:text-2xl ${
                        remaining < 0 ? "text-red-400" : "text-green-400"
                      }`}
                    >
                      R$ {remaining.toFixed(2)}
                    </h2>
                  </div>
                </div>
              </div>

              <button
                onClick={deleteList}
                disabled={deleting}
                className="mt-3 w-full rounded-2xl bg-red-500 px-6 py-4 font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
              >
                {deleting ? "Excluindo..." : "🗑️ Excluir lista"}
              </button>
            </div>
          </div>

          <div className="mb-6 rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
            <h2 className="mb-4 text-xl font-bold">Supermercado</h2>

            <div className="flex flex-col gap-3 md:flex-row">
              <select
                value={selectedSupermarket}
                onChange={(e) => setSelectedSupermarket(e.target.value)}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-4 outline-none"
              >
                <option value="">Selecione um supermercado</option>

                {supermarkets.map((market) => (
                  <option key={market.id} value={market.id}>
                    {market.name}
                    {market.city ? ` - ${market.city}` : ""}
                  </option>
                ))}
              </select>

              <button
                onClick={saveSupermarket}
                className="rounded-xl bg-blue-500 px-6 py-4 font-semibold text-white transition hover:opacity-90"
              >
                Salvar
              </button>
            </div>
          </div>

          <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-zinc-800 bg-zinc-900 p-4 md:flex-row">
            <input
              type="email"
              placeholder="Compartilhar por email"
              value={shareEmail}
              onChange={(e) => setShareEmail(e.target.value)}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 outline-none transition focus:border-zinc-500"
            />

            <button
              onClick={shareList}
              disabled={sharing}
              className="rounded-xl bg-blue-500 px-6 py-3 font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
            >
              {sharing ? "Compartilhando..." : "Compartilhar"}
            </button>
          </div>

          {listStatus === "planning" && (
            <>
              <div className="mb-4">
                <button
                  onClick={startShopping}
                  className="w-full rounded-2xl bg-green-500 px-6 py-4 text-lg font-bold text-black transition hover:opacity-90 md:w-auto"
                >
                  🛒 Iniciar compra
                </button>
              </div>

              <div className="mb-8 rounded-2xl border border-zinc-800 bg-zinc-900 p-5 md:p-6">
                <h2 className="mb-6 text-2xl font-bold">Adicionar item</h2>

                <div className="flex flex-col gap-4 md:grid md:grid-cols-3">
                  <input
                    type="text"
                    placeholder="Nome do item"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-4 outline-none transition focus:border-zinc-500"
                  />

                  <input
                    type="number"
                    placeholder="Quantidade"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-4 outline-none transition focus:border-zinc-500"
                  />

                  <button
                    onClick={createItem}
                    disabled={loading}
                    className="rounded-xl bg-white px-4 py-4 font-semibold text-black transition hover:opacity-90 disabled:opacity-50"
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
                <ListCard
                  key={item.id}
                  item={item}
                  listStatus={listStatus}
                  editingItem={editingItem}
                  editingName={editingName}
                  editingQuantity={editingQuantity}
                  editingPrice={editingPrice}
                  setEditingItem={setEditingItem}
                  setEditingName={setEditingName}
                  setEditingQuantity={setEditingQuantity}
                  setEditingPrice={setEditingPrice}
                  toggleChecked={toggleChecked}
                  deleteItem={deleteItem}
                  updateItem={updateItem}
                  updatePrice={updatePrice}
                />
              ))}
            </div>
          )}
        </div>

        {listStatus === "shopping" && (
          <>
            <div className="mx-auto mb-24 max-w-5xl px-4 md:px-6">
              <button
                onClick={finishShopping}
                className="w-full rounded-2xl bg-blue-500 px-6 py-4 text-lg font-bold text-white transition hover:opacity-90"
              >
                ✅ Finalizar compra
              </button>
            </div>

            <div className="fixed bottom-0 left-0 right-0 border-t border-zinc-800 bg-zinc-900/95 p-4 backdrop-blur">
              <div className="mx-auto flex max-w-5xl items-center justify-between">
                <div>
                  <p className="text-xs text-zinc-400 md:text-sm">Total</p>

                  <h2 className="text-xl font-bold md:text-3xl">
                    R$ {total.toFixed(2)}
                  </h2>
                </div>

                <div className="text-right">
                  <p className="text-xs text-zinc-400 md:text-sm">Restante</p>

                  <h2
                    className={`text-xl font-bold md:text-3xl ${
                      remaining < 0 ? "text-red-400" : "text-green-400"
                    }`}
                  >
                    R$ {remaining.toFixed(2)}
                  </h2>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </AppLayout>
  );
}
