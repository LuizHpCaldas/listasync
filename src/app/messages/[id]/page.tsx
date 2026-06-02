"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import AppLayout from "../../../components/AppLayout";
import { createClient } from "../../../lib/supabase/client";

interface Conversation {
  conversation_id: string;
}

export default function MessagesPage() {
  const supabase = useMemo(() => createClient(), []);

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  const loadConversations = useCallback(async () => {
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
      setLoading(false);
      return;
    }

    setConversations((data as Conversation[]) || []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    queueMicrotask(() => {
      void loadConversations();
    });
  }, [loadConversations]);

  return (
    <AppLayout>
      <div className="p-6">
        <h1 className="mb-6 text-3xl font-bold">Mensagens</h1>

        {loading ? (
          <div className="text-zinc-400">Carregando...</div>
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
