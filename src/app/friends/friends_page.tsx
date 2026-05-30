"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import AppLayout from "../../components/AppLayout";
import { createClient } from "../../lib/supabase/client";
import { toast } from "sonner";

interface FriendProfile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
}

interface Friend {
  id: string;
  status: "pending" | "accepted" | "rejected";
  requester_id: string | null;
  addressee_id: string | null;
  created_at: string | null;
  profile: FriendProfile;
}

export default function FriendsPage() {
  const supabase = createClient();

  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pendingReceived, setPendingReceived] = useState<Friend[]>([]);
  const [pendingSent, setPendingSent] = useState<Friend[]>([]);
  const [searchEmail, setSearchEmail] = useState("");
  const [searching, setSearching] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchFriends = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    setCurrentUserId(user.id);

    const { data, error } = await supabase
      .from("friends")
      .select("*")
      .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`);

    if (error) {
      console.error(error);
      return;
    }

    const enriched: Friend[] = [];

    for (const f of data || []) {
      const otherId =
        f.requester_id === user.id ? f.addressee_id : f.requester_id;
      if (!otherId) continue;

      const { data: profile } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .eq("id", otherId)
        .single();

      enriched.push({
        ...f,
        status: f.status as "pending" | "accepted" | "rejected",
        profile: {
          id: otherId as string,
          full_name: profile?.full_name ?? null,
          avatar_url: profile?.avatar_url ?? null,
        },
      });
    }

    setFriends(enriched.filter((f) => f.status === "accepted"));
    setPendingReceived(
      enriched.filter(
        (f) => f.status === "pending" && f.addressee_id === user.id,
      ),
    );
    setPendingSent(
      enriched.filter(
        (f) => f.status === "pending" && f.requester_id === user.id,
      ),
    );
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    queueMicrotask(() => fetchFriends());
  }, [fetchFriends]);

  async function sendRequest() {
    if (!searchEmail.trim()) {
      toast.error("Digite um email");
      return;
    }

    try {
      setSearching(true);

      const { data: userId, error: userError } = await supabase.rpc(
        "get_user_id_by_email",
        { user_email: searchEmail.trim() },
      );

      if (userError || !userId) {
        toast.error("Usuário não encontrado");
        return;
      }

      if (userId === currentUserId) {
        toast.error("Você não pode se adicionar");
        return;
      }

      const { data: existing } = await supabase
        .from("friends")
        .select("id, status")
        .or(
          `and(requester_id.eq.${currentUserId},addressee_id.eq.${userId}),and(requester_id.eq.${userId},addressee_id.eq.${currentUserId})`,
        )
        .maybeSingle();

      if (existing) {
        if (existing.status === "accepted") toast.error("Já são amigos!");
        else toast.error("Pedido já existe");
        return;
      }

      const { error } = await supabase.from("friends").insert({
        requester_id: currentUserId,
        addressee_id: userId,
        status: "pending",
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      await supabase.from("notifications").insert({
        user_id: userId,
        type: "friend_request",
        title: "Novo pedido de amizade",
        message: "Alguém quer se conectar com você no ListaSync",
        read: false,
      });

      setSearchEmail("");
      toast.success("Pedido enviado!");
      fetchFriends();
    } catch (err) {
      console.error(err);
    } finally {
      setSearching(false);
    }
  }

  async function respondRequest(friendId: string, accept: boolean) {
    const { error } = await supabase
      .from("friends")
      .update({ status: accept ? "accepted" : "rejected" })
      .eq("id", friendId);

    if (error) {
      toast.error("Erro ao responder pedido");
      return;
    }

    toast.success(accept ? "Amizade aceita! 🎉" : "Pedido recusado");
    fetchFriends();
  }

  async function removeFriend(friendId: string) {
    const confirmed = confirm("Deseja remover este amigo?");
    if (!confirmed) return;

    const { error } = await supabase
      .from("friends")
      .delete()
      .eq("id", friendId);

    if (error) {
      toast.error("Erro ao remover amigo");
      return;
    }

    toast.success("Amigo removido");
    fetchFriends();
  }

  function getInitials(full_name: string | null, id: string) {
    if (full_name) return full_name.slice(0, 2).toUpperCase();
    return id.slice(0, 2).toUpperCase();
  }

  return (
    <AppLayout>
      <main className="min-h-screen bg-zinc-950 p-4 pb-32 text-white md:p-6">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8">
            <h1 className="text-4xl font-bold">Amigos & Família</h1>
            <p className="mt-2 text-zinc-400">
              Conecte-se e compartilhe listas com quem você conhece
            </p>
          </div>

          {/* Adicionar amigo */}
          <div className="mb-8 rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <h2 className="mb-4 text-xl font-bold">Adicionar por email</h2>
            <div className="flex flex-col gap-3 md:flex-row">
              <input
                type="email"
                placeholder="Email do usuário"
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendRequest()}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 outline-none transition focus:border-zinc-500"
              />
              <button
                onClick={sendRequest}
                disabled={searching}
                className="rounded-xl bg-white px-6 py-3 font-semibold text-black transition hover:opacity-90 disabled:opacity-50"
              >
                {searching ? "Buscando..." : "Enviar pedido"}
              </button>
            </div>
          </div>

          {/* Pedidos recebidos */}
          {pendingReceived.length > 0 && (
            <div className="mb-8">
              <h2 className="mb-4 text-xl font-bold">
                Pedidos recebidos{" "}
                <span className="ml-2 rounded-full bg-blue-500 px-2 py-0.5 text-sm">
                  {pendingReceived.length}
                </span>
              </h2>
              <div className="space-y-3">
                {pendingReceived.map((f) => (
                  <div
                    key={f.id}
                    className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-900 p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-700 text-sm font-bold">
                        {getInitials(f.profile.full_name, f.profile.id)}
                      </div>
                      <div>
                        <p className="font-semibold">
                          {f.profile.full_name || "Usuário"}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => respondRequest(f.id, true)}
                        className="rounded-xl bg-green-500 px-4 py-2 text-sm font-semibold text-black transition hover:opacity-90"
                      >
                        Aceitar
                      </button>
                      <button
                        onClick={() => respondRequest(f.id, false)}
                        className="rounded-xl bg-zinc-700 px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
                      >
                        Recusar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pedidos enviados */}
          {pendingSent.length > 0 && (
            <div className="mb-8">
              <h2 className="mb-4 text-xl font-bold text-zinc-400">
                Pedidos enviados
              </h2>
              <div className="space-y-3">
                {pendingSent.map((f) => (
                  <div
                    key={f.id}
                    className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-900 p-4 opacity-70"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-700 text-sm font-bold">
                        {getInitials(f.profile.full_name, f.profile.id)}
                      </div>
                      <div>
                        <p className="font-semibold">
                          {f.profile.full_name || "Usuário"}
                        </p>
                        <p className="text-sm text-zinc-400">
                          Aguardando resposta...
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFriend(f.id)}
                      className="rounded-xl bg-zinc-700 px-4 py-2 text-sm font-semibold text-zinc-300 transition hover:opacity-90"
                    >
                      Cancelar
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Lista de amigos */}
          <div>
            <h2 className="mb-4 text-xl font-bold">
              Seus amigos{" "}
              <span className="ml-2 text-base font-normal text-zinc-400">
                ({friends.length})
              </span>
            </h2>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-16 animate-pulse rounded-2xl border border-zinc-800 bg-zinc-900"
                  />
                ))}
              </div>
            ) : friends.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-zinc-700 p-12 text-center">
                <p className="text-zinc-400">Nenhum amigo adicionado ainda.</p>
                <p className="mt-1 text-sm text-zinc-600">
                  Busque pelo email acima para começar
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {friends.map((f) => (
                  <div
                    key={f.id}
                    className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-900 p-4"
                  >
                    <div className="flex items-center gap-3">
                      {f.profile.avatar_url ? (
                        <Image
                          src={f.profile.avatar_url}
                          alt=""
                          width={40}
                          height={40}
                          className="rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-700 text-sm font-bold">
                          {getInitials(f.profile.full_name, f.profile.id)}
                        </div>
                      )}
                      <p className="font-semibold">
                        {f.profile.full_name || "Usuário"}
                      </p>
                    </div>
                    <button
                      onClick={() => removeFriend(f.id)}
                      className="rounded-xl bg-zinc-800 px-4 py-2 text-sm font-semibold text-zinc-400 transition hover:bg-red-500/20 hover:text-red-400"
                    >
                      Remover
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </AppLayout>
  );
}
