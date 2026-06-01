"use client";

import {
  useCallback,
  useEffect,
  useState,
  useTransition,
  useMemo,
  memo,
} from "react";
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
  requester_id: string;
  addressee_id: string;
  created_at: string;
  profile: FriendProfile;
}

// Extracted component for better performance
const FriendListItem = memo(
  ({
    friend,
    onRemove,
    isRemoving,
  }: {
    friend: Friend;
    onRemove: (id: string) => void;
    isRemoving: boolean;
  }) => {
    const getInitials = (full_name: string | null, id: string) => {
      if (full_name) return full_name.slice(0, 2).toUpperCase();
      return id.slice(0, 2).toUpperCase();
    };

    return (
      <div className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-900 p-4 transition hover:border-zinc-700">
        <div className="flex items-center gap-3">
          {friend.profile.avatar_url ? (
            <Image
              src={friend.profile.avatar_url}
              alt={`Avatar de ${friend.profile.full_name || "usuário"}`}
              width={40}
              height={40}
              className="rounded-full object-cover"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-700 text-sm font-bold">
              {getInitials(friend.profile.full_name, friend.profile.id)}
            </div>
          )}
          <p className="font-semibold">
            {friend.profile.full_name || "Usuário"}
          </p>
        </div>
        <button
          onClick={() => onRemove(friend.id)}
          disabled={isRemoving}
          className="rounded-xl bg-zinc-800 px-4 py-2 text-sm font-semibold text-zinc-400 transition hover:bg-red-500/20 hover:text-red-400 disabled:opacity-50"
          aria-label={`Remover ${friend.profile.full_name || "usuário"} dos amigos`}
        >
          {isRemoving ? "Removendo..." : "Remover"}
        </button>
      </div>
    );
  },
);

FriendListItem.displayName = "FriendListItem";

// Pending request component
const PendingReceivedItem = memo(
  ({
    friend,
    onRespond,
    isResponding,
  }: {
    friend: Friend;
    onRespond: (id: string, accept: boolean) => void;
    isResponding: boolean;
  }) => {
    const getInitials = (full_name: string | null, id: string) => {
      if (full_name) return full_name.slice(0, 2).toUpperCase();
      return id.slice(0, 2).toUpperCase();
    };

    return (
      <div className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-700 text-sm font-bold">
            {getInitials(friend.profile.full_name, friend.profile.id)}
          </div>
          <div>
            <p className="font-semibold">
              {friend.profile.full_name || "Usuário"}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onRespond(friend.id, true)}
            disabled={isResponding}
            className="rounded-xl bg-green-500 px-4 py-2 text-sm font-semibold text-black transition hover:opacity-90 disabled:opacity-50"
            aria-label={`Aceitar pedido de ${friend.profile.full_name || "usuário"}`}
          >
            {isResponding ? "Aceitando..." : "Aceitar"}
          </button>
          <button
            onClick={() => onRespond(friend.id, false)}
            disabled={isResponding}
            className="rounded-xl bg-zinc-700 px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
            aria-label={`Recusar pedido de ${friend.profile.full_name || "usuário"}`}
          >
            Recusar
          </button>
        </div>
      </div>
    );
  },
);

PendingReceivedItem.displayName = "PendingReceivedItem";

const PendingSentItem = memo(
  ({
    friend,
    onCancel,
    isCancelling,
  }: {
    friend: Friend;
    onCancel: (id: string) => void;
    isCancelling: boolean;
  }) => {
    const getInitials = (full_name: string | null, id: string) => {
      if (full_name) return full_name.slice(0, 2).toUpperCase();
      return id.slice(0, 2).toUpperCase();
    };

    return (
      <div className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-900 p-4 opacity-70">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-700 text-sm font-bold">
            {getInitials(friend.profile.full_name, friend.profile.id)}
          </div>
          <div>
            <p className="font-semibold">
              {friend.profile.full_name || "Usuário"}
            </p>
            <p className="text-sm text-zinc-400">Aguardando resposta...</p>
          </div>
        </div>
        <button
          onClick={() => onCancel(friend.id)}
          disabled={isCancelling}
          className="rounded-xl bg-zinc-700 px-4 py-2 text-sm font-semibold text-zinc-300 transition hover:opacity-90 disabled:opacity-50"
          aria-label={`Cancelar pedido para ${friend.profile.full_name || "usuário"}`}
        >
          {isCancelling ? "Cancelando..." : "Cancelar"}
        </button>
      </div>
    );
  },
);

PendingSentItem.displayName = "PendingSentItem";

export default function FriendsPage() {
  const supabase = useMemo(() => createClient(), []);

  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pendingReceived, setPendingReceived] = useState<Friend[]>([]);
  const [pendingSent, setPendingSent] = useState<Friend[]>([]);
  const [searchEmail, setSearchEmail] = useState("");
  const [searching, setSearching] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const fetchFriends = useCallback(async () => {
    try {
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
        toast.error("Erro ao carregar amigos");
        setLoading(false);
        return;
      }

      if (!data || data.length === 0) {
        setFriends([]);
        setPendingReceived([]);
        setPendingSent([]);
        setLoading(false);
        return;
      }

      // Get all friend IDs for batch query and filter out nulls
      const friendIds = data
        .map((f) =>
          f.requester_id === user.id ? f.addressee_id : f.requester_id,
        )
        .filter((id): id is string => id !== null);

      // Single query for all profiles (fixes N+1 problem)
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .in("id", friendIds);

      if (profilesError) {
        console.error(profilesError);
      }

      const profileMap = new Map(profiles?.map((p) => [p.id, p]) || []);

      const enriched: Friend[] = data.map((f) => {
        const otherId = (
          f.requester_id === user.id ? f.addressee_id : f.requester_id
        ) as string;
        const profile = profileMap.get(otherId);

        return {
          id: f.id,
          status: f.status as "pending" | "accepted" | "rejected",
          requester_id: f.requester_id!,
          addressee_id: f.addressee_id!,
          created_at: f.created_at!,
          profile: {
            id: otherId,
            full_name: profile?.full_name ?? null,
            avatar_url: profile?.avatar_url ?? null,
          },
        };
      });

      startTransition(() => {
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
      });
    } catch (err) {
      console.error("Error fetching friends:", err);
      toast.error("Erro ao carregar lista de amigos");
      setLoading(false);
    }
  }, [supabase]);

  // Real-time subscription for friend updates
  useEffect(() => {
    if (!currentUserId) return;

    const friendsSubscription = supabase
      .channel("friends-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "friends",
        },
        (payload) => {
          const row = (payload.new || payload.old) as
            | {
                requester_id?: string;
                addressee_id?: string;
              }
            | undefined;

          if (
            row &&
            (row.requester_id === currentUserId ||
              row.addressee_id === currentUserId)
          ) {
            void fetchFriends();
          }
        },
      )
      .subscribe();

    return () => {
      friendsSubscription.unsubscribe();
    };
  }, [currentUserId, fetchFriends, supabase]);

  useEffect(() => {
    const loadFriends = async () => {
      await fetchFriends();
    };

    void loadFriends();
  }, [fetchFriends]);

  async function sendRequest() {
    if (!searchEmail.trim()) {
      toast.error("Digite um email");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(searchEmail.trim())) {
      toast.error("Digite um email válido");
      return;
    }

    setSearching(true);

    try {
      const { data: userId, error: userError } = await supabase.rpc(
        "get_user_id_by_email",
        { user_email: searchEmail.trim() },
      );

      if (userError) {
        console.error("RPC Error:", userError);
        toast.error(
          "Erro ao buscar usuário. Verifique se o email está correto.",
        );
        return;
      }

      if (!userId) {
        toast.error("Usuário não encontrado");
        return;
      }

      if (userId === currentUserId) {
        toast.error("Você não pode se adicionar");
        return;
      }

      // Check if friend request already exists
      const { data: existing, error: existingError } = await supabase
        .from("friends")
        .select("id, status")
        .or(
          `and(requester_id.eq.${currentUserId},addressee_id.eq.${userId}),and(requester_id.eq.${userId},addressee_id.eq.${currentUserId})`,
        )
        .maybeSingle();

      if (existingError) {
        console.error(existingError);
      }

      if (existing) {
        if (existing.status === "accepted") {
          toast.error("Já são amigos!");
        } else if (existing.status === "pending") {
          toast.error("Pedido de amizade já existe");
        } else {
          toast.error("Não foi possível enviar o pedido");
        }
        return;
      }

      const { error: insertError } = await supabase.from("friends").insert({
        requester_id: currentUserId,
        addressee_id: userId,
        status: "pending",
      });

      if (insertError) {
        toast.error(insertError.message);
        return;
      }

      // Create notification
      const { error: notifError } = await supabase
        .from("notifications")
        .insert({
          user_id: userId,
          type: "friend_request",
          title: "Novo pedido de amizade",
          message: `${searchEmail.trim()} quer se conectar com você no ListaSync`,
          read: false,
        });

      if (notifError) {
        console.error("Error creating notification:", notifError);
      }

      setSearchEmail("");
      toast.success("Pedido enviado com sucesso!");
      fetchFriends();
    } catch (err) {
      console.error("Error in sendRequest:", err);
      toast.error("Erro ao enviar pedido. Tente novamente.");
    } finally {
      setSearching(false);
    }
  }

  // Debounced send request function

  async function respondRequest(friendId: string, accept: boolean) {
    setActionLoading(friendId);

    try {
      const { error } = await supabase
        .from("friends")
        .update({ status: accept ? "accepted" : "rejected" })
        .eq("id", friendId);

      if (error) {
        toast.error("Erro ao responder pedido");
        return;
      }

      toast.success(accept ? "Amizade aceita! 🎉" : "Pedido recusado");

      // If accepted, create a welcome notification
      if (accept) {
        const friendRequest = [...pendingReceived, ...pendingSent].find(
          (f) => f.id === friendId,
        );
        if (friendRequest) {
          const otherUserId =
            friendRequest.requester_id === currentUserId
              ? friendRequest.addressee_id
              : friendRequest.requester_id;

          await supabase.from("notifications").insert({
            user_id: otherUserId,
            type: "friend_request_accepted",
            title: "Pedido de amizade aceito!",
            message: "Agora vocês são amigos no ListaSync 🎉",
            read: false,
          });
        }
      }

      fetchFriends();
    } catch (err) {
      console.error("Error responding to request:", err);
      toast.error("Erro ao processar resposta");
    } finally {
      setActionLoading(null);
    }
  }

  async function removeFriend(friendId: string) {
    const confirmed = window.confirm("Deseja remover este amigo?");
    if (!confirmed) return;

    setActionLoading(friendId);

    try {
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
    } catch (err) {
      console.error("Error removing friend:", err);
      toast.error("Erro ao remover amigo");
    } finally {
      setActionLoading(null);
    }
  }

  async function cancelRequest(friendId: string) {
    setActionLoading(friendId);

    try {
      const { error } = await supabase
        .from("friends")
        .delete()
        .eq("id", friendId);

      if (error) {
        toast.error("Erro ao cancelar pedido");
        return;
      }

      toast.success("Pedido cancelado");
      fetchFriends();
    } catch (err) {
      console.error("Error cancelling request:", err);
      toast.error("Erro ao cancelar pedido");
    } finally {
      setActionLoading(null);
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      sendRequest();
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchEmail(e.target.value);
    // Optional: Use debounced search for real-time validation
    // debouncedSendRequest();
  };

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
                onChange={handleEmailChange}
                onKeyDown={handleKeyDown}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 outline-none transition focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
                aria-label="Email do usuário para adicionar como amigo"
                disabled={searching}
              />
              <button
                onClick={sendRequest}
                disabled={searching}
                className="rounded-xl bg-white px-6 py-3 font-semibold text-black transition hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Enviar pedido de amizade"
              >
                {searching ? "Buscando..." : "Enviar pedido"}
              </button>
            </div>
            <p className="mt-2 text-xs text-zinc-500">
              Digite o email exato do usuário que deseja adicionar
            </p>
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
                  <PendingReceivedItem
                    key={f.id}
                    friend={f}
                    onRespond={respondRequest}
                    isResponding={actionLoading === f.id}
                  />
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
                  <PendingSentItem
                    key={f.id}
                    friend={f}
                    onCancel={cancelRequest}
                    isCancelling={actionLoading === f.id}
                  />
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
                <div className="mb-3 text-5xl">👋</div>
                <p className="text-zinc-400">Nenhum amigo adicionado ainda.</p>
                <p className="mt-1 text-sm text-zinc-600">
                  Busque pelo email acima para começar a conectar
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {friends.map((f) => (
                  <FriendListItem
                    key={f.id}
                    friend={f}
                    onRemove={removeFriend}
                    isRemoving={actionLoading === f.id}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </AppLayout>
  );
}
