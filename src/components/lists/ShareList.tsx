"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { createClient } from "../../lib/supabase/client";
import { toast } from "sonner";

interface Friend {
  friendshipId: string;
  userId: string;
  full_name: string | null;
  avatar_url: string | null;
}

interface Props {
  listId: string;
  isPremium: boolean;
}

export default function ShareList({ listId, isPremium }: Props) {
  const supabase = createClient();

  const [tab, setTab] = useState<"friends" | "email">("friends");
  const [friends, setFriends] = useState<Friend[]>([]);
  const [sharedWith, setSharedWith] = useState<string[]>([]);
  const [shareEmail, setShareEmail] = useState("");
  const [sharing, setSharing] = useState(false);
  const [loadingFriends, setLoadingFriends] = useState(true);
  const [sharingFriendId, setSharingFriendId] = useState<string | null>(null);

  const fetchFriendsAndMembers = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data: friendships } = await supabase
      .from("friends")
      .select("*")
      .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
      .eq("status", "accepted");

    const { data: members } = await supabase
      .from("list_members")
      .select("user_id")
      .eq("list_id", listId);

    setSharedWith(
      (members || [])
        .map((m) => m.user_id)
        .filter((id): id is string => id !== null),
    );

    const enriched: Friend[] = [];
    for (const f of friendships || []) {
      const otherId =
        f.requester_id === user.id ? f.addressee_id : f.requester_id;
      if (!otherId) continue;

      const { data: profile } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .eq("id", otherId)
        .single();

      enriched.push({
        friendshipId: f.id,
        userId: otherId,
        full_name: profile?.full_name ?? null,
        avatar_url: profile?.avatar_url ?? null,
      });
    }

    setFriends(enriched);
    setLoadingFriends(false);
  }, [supabase, listId]);

  useEffect(() => {
    queueMicrotask(() => fetchFriendsAndMembers());
  }, [fetchFriendsAndMembers]);

  async function shareWithFriend(
    friendUserId: string,
    friendName: string | null,
  ) {
    try {
      setSharingFriendId(friendUserId);

      const { error } = await supabase.from("list_members").insert({
        list_id: listId,
        user_id: friendUserId,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      await supabase.from("notifications").insert({
        user_id: friendUserId,
        type: "list_share",
        title: "Nova lista compartilhada",
        message: "Uma lista foi compartilhada com você",
        read: false,
      });

      setSharedWith((prev) => [...prev, friendUserId]);
      toast.success(`Lista compartilhada com ${friendName || "amigo"}! 🎉`);
    } catch (err) {
      console.error(err);
    } finally {
      setSharingFriendId(null);
    }
  }

  async function removeAccess(friendUserId: string) {
    const { error } = await supabase
      .from("list_members")
      .delete()
      .eq("list_id", listId)
      .eq("user_id", friendUserId);

    if (error) {
      toast.error("Erro ao remover acesso");
      return;
    }

    setSharedWith((prev) => prev.filter((id) => id !== friendUserId));
    toast.success("Acesso removido");
  }

  async function shareByEmail() {
    if (!shareEmail.trim()) {
      toast.error("Digite um email");
      return;
    }

    try {
      setSharing(true);

      const { data: userId, error: userError } = await supabase.rpc(
        "get_user_id_by_email",
        { user_email: shareEmail.trim() },
      );

      if (userError || !userId) {
        toast.error("Usuário não encontrado");
        return;
      }

      const { error } = await supabase.from("list_members").insert({
        list_id: listId,
        user_id: userId,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      await supabase.from("notifications").insert({
        user_id: userId,
        type: "list_share",
        title: "Nova lista compartilhada",
        message: "Uma lista foi compartilhada com você",
        read: false,
      });

      setShareEmail("");
      setSharedWith((prev) => [...prev, userId]);
      toast.success("Lista compartilhada!");
    } catch (err) {
      console.error(err);
    } finally {
      setSharing(false);
    }
  }

  function getInitials(full_name: string | null, userId: string) {
    if (full_name) return full_name.slice(0, 2).toUpperCase();
    return userId.slice(0, 2).toUpperCase();
  }

  if (!isPremium) return null;

  return (
    <div className="mb-6 rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
      <h2 className="mb-4 text-xl font-bold">Compartilhar lista</h2>

      {/* Tabs */}
      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setTab("friends")}
          className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
            tab === "friends"
              ? "bg-white text-black"
              : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
          }`}
        >
          👥 Amigos
        </button>
        <button
          onClick={() => setTab("email")}
          className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
            tab === "email"
              ? "bg-white text-black"
              : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
          }`}
        >
          ✉️ Por email
        </button>
      </div>

      {tab === "friends" && (
        <>
          {loadingFriends ? (
            <div className="space-y-2">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="h-14 animate-pulse rounded-xl bg-zinc-800"
                />
              ))}
            </div>
          ) : friends.length === 0 ? (
            <div className="rounded-xl border border-dashed border-zinc-700 p-6 text-center">
              <p className="text-zinc-400">Nenhum amigo ainda.</p>
              <p className="mt-1 text-sm text-zinc-600">
                Adicione amigos na página{" "}
                <a href="/friends" className="text-blue-400 underline">
                  Amigos & Família
                </a>
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {friends.map((f) => {
                const isShared = sharedWith.includes(f.userId);
                return (
                  <div
                    key={f.userId}
                    className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-800/50 px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      {f.avatar_url ? (
                        <Image
                          src={f.avatar_url}
                          alt=""
                          width={36}
                          height={36}
                          className="rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-600 text-xs font-bold">
                          {getInitials(f.full_name, f.userId)}
                        </div>
                      )}
                      <p className="text-sm font-semibold">
                        {f.full_name || "Usuário"}
                      </p>
                    </div>

                    {isShared ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-green-400">
                          ✓ Compartilhado
                        </span>
                        <button
                          onClick={() => removeAccess(f.userId)}
                          className="rounded-lg bg-zinc-700 px-3 py-1.5 text-xs font-semibold text-zinc-300 transition hover:bg-red-500/20 hover:text-red-400"
                        >
                          Remover
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => shareWithFriend(f.userId, f.full_name)}
                        disabled={sharingFriendId === f.userId}
                        className="rounded-lg bg-blue-500 px-4 py-1.5 text-xs font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
                      >
                        {sharingFriendId === f.userId ? "..." : "Compartilhar"}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {tab === "email" && (
        <div className="flex flex-col gap-3 md:flex-row">
          <input
            type="email"
            placeholder="Email do usuário"
            value={shareEmail}
            onChange={(e) => setShareEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && shareByEmail()}
            className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 outline-none transition focus:border-zinc-500"
          />
          <button
            onClick={shareByEmail}
            disabled={sharing}
            className="rounded-xl bg-blue-500 px-6 py-3 font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
          >
            {sharing ? "Compartilhando..." : "Compartilhar"}
          </button>
        </div>
      )}
    </div>
  );
}
