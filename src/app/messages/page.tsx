"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import AppLayout from "../../components/AppLayout";
import { createClient } from "../../lib/supabase/client";

interface Conversation {
  conversation_id: string;
}

export default function MessagesPage() {
  const supabase = useMemo(() => createClient(), []);

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  const loadConversations = useCallback(async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("conversation_participants")
        .select("conversation_id")
        .eq("user_id", user.id);

      if (error) {
        console.error(error);
        return;
      }

      setConversations(
        (data ?? []).filter(
          (item): item is Conversation =>
            typeof item.conversation_id === "string",
        ),
      );
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    queueMicrotask(() => {
      void loadConversations();
    });
  }, [loadConversations]);

  return (
    <AppLayout>
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Mensagens</h1>

          <Link
            href="/messages/new"
            className="rounded-xl bg-violet-600 px-4 py-2 font-medium text-white transition hover:bg-violet-500"
          >
            Nova conversa
          </Link>
        </div>

        {loading ? (
          <div className="text-zinc-400">Carregando conversas...</div>
        ) : conversations.length === 0 ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 text-zinc-400">
            Você ainda não possui conversas.
          </div>
        ) : (
          <div className="space-y-3">
            {conversations.map((conversation) => (
              <Link
                key={conversation.conversation_id}
                href={`/messages/${conversation.conversation_id}`}
                className="block rounded-2xl border border-zinc-800 bg-zinc-900 p-4 transition hover:border-violet-500"
              >
                <h2 className="font-medium">Conversa</h2>

                <p className="mt-1 text-sm text-zinc-500">
                  {conversation.conversation_id}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
