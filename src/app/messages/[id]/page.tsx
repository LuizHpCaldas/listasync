"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import AppLayout from "../../../components/AppLayout";
import { createClient } from "../../../lib/supabase/client";

interface Message {
  id: string;
  sender_id: string;
  message: string;
  created_at: string;
}

interface Props {
  params: {
    id: string;
  };
}

export default function ConversationPage({ params }: Props) {
  const supabase = useMemo(() => createClient(), []);

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");

  const loadMessages = useCallback(async () => {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", params.id)
      .order("created_at", {
        ascending: true,
      });

    if (error) {
      console.error(error);
      return;
    }

    setMessages((data as Message[]) || []);
  }, [params.id, supabase]);

  useEffect(() => {
    queueMicrotask(() => {
      void loadMessages();
    });
  }, [loadMessages]);

  async function sendMessage() {
    if (!newMessage.trim()) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { error } = await supabase.from("messages").insert({
      conversation_id: params.id,
      sender_id: user.id,
      message: newMessage,
    });

    if (error) {
      console.error(error);
      return;
    }

    setNewMessage("");

    await loadMessages();
  }

  return (
    <AppLayout>
      <div className="flex h-[calc(100vh-100px)] flex-col p-6">
        <h1 className="mb-6 text-2xl font-bold">Conversa</h1>

        <div className="flex-1 space-y-3 overflow-y-auto rounded-xl border border-zinc-800 bg-zinc-900 p-4">
          {messages.length === 0 ? (
            <div className="text-zinc-500">Nenhuma mensagem enviada.</div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className="rounded-xl bg-zinc-800 p-3">
                <p>{msg.message}</p>

                <p className="mt-2 text-xs text-zinc-500">
                  {new Date(msg.created_at).toLocaleString()}
                </p>
              </div>
            ))
          )}
        </div>

        <div className="mt-4 flex gap-3">
          <input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Digite uma mensagem..."
            className="flex-1 rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 outline-none"
          />

          <button
            onClick={sendMessage}
            className="rounded-xl bg-violet-600 px-6 py-3 font-semibold text-white"
          >
            Enviar
          </button>
        </div>
      </div>
    </AppLayout>
  );
}
