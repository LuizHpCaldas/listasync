"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import AppLayout from "../../../components/AppLayout";
import { createClient } from "../../../lib/supabase/client";

interface Friend {
  id: string;
  full_name: string | null;
}

interface Friendship {
  requester_id: string | null;
  addressee_id: string | null;
}

export default function NewConversationPage() {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();

  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFriends = useCallback(async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const { data: friendships, error } = await supabase
        .from("friends")
        .select("requester_id, addressee_id")
        .eq("status", "accepted")
        .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`);

      if (error) {
        console.error(error);
        setLoading(false);
        return;
      }

      const friendIds =
        (friendships as Friendship[])
          ?.map((friendship) => {
            if (friendship.requester_id === user.id) {
              return friendship.addressee_id;
            }

            if (friendship.addressee_id === user.id) {
              return friendship.requester_id;
            }

            return null;
          })
          .filter((id): id is string => id !== null) || [];

      if (friendIds.length === 0) {
        setFriends([]);
        setLoading(false);
        return;
      }

      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", friendIds);

      if (profilesError) {
        console.error(profilesError);
        setLoading(false);
        return;
      }

      setFriends((profiles as Friend[]) || []);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    queueMicrotask(() => {
      void loadFriends();
    });
  }, [loadFriends]);

  async function startConversation(friendId: string) {
    try {
      console.log("AMIGO:", friendId);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data: conversation, error } = await supabase
        .from("conversations")
        .insert({})
        .select()
        .single();

      if (error || !conversation) {
        console.error(error);
        return;
      }

      const { error: participantError } = await supabase
        .from("conversation_participants")
        .insert([
          {
            conversation_id: conversation.id,
            user_id: user.id,
          },
          {
            conversation_id: conversation.id,
            user_id: friendId,
          },
        ]);

      if (participantError) {
        console.error(participantError);
        return;
      }

      router.push(`/messages/${conversation.id}`);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <AppLayout>
      <div className="p-6">
        <h1 className="mb-6 text-3xl font-bold">Nova Conversa</h1>

        {loading ? (
          <div className="text-zinc-400">Carregando amigos...</div>
        ) : friends.length === 0 ? (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 text-zinc-400">
            Você ainda não possui amigos aceitos.
          </div>
        ) : (
          <div className="space-y-3">
            {friends.map((friend) => (
              <button
                key={friend.id}
                onClick={() => startConversation(friend.id)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-4 text-left transition hover:border-violet-500"
              >
                {friend.full_name || "Usuário"}
              </button>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
