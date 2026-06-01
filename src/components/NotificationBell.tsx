"use client";

import { Bell, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "../lib/supabase/client";

interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

export default function NotificationBell() {
  const supabase = useMemo(() => createClient(), []);

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const loadNotifications = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", {
        ascending: false,
      })
      .limit(20);

    if (error) {
      console.error("Erro ao carregar notificações:", error);
      return;
    }

    setNotifications((data as Notification[]) || []);
  }, [supabase]);

  useEffect(() => {
    queueMicrotask(() => {
      void loadNotifications();
    });
  }, [loadNotifications]);

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | undefined;

    async function subscribe() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      channel = supabase
        .channel(`notifications-${user.id}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${user.id}`,
          },
          () => {
            void loadNotifications();
          },
        )
        .subscribe();
    }

    void subscribe();

    return () => {
      channel?.unsubscribe();
    };
  }, [supabase, loadNotifications]);

  async function markAsRead(id: string) {
    const { error } = await supabase
      .from("notifications")
      .update({
        read: true,
      })
      .eq("id", id);

    if (error) {
      console.error(error);
      return;
    }

    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id
          ? {
              ...notification,
              read: true,
            }
          : notification,
      ),
    );
  }

  async function markAllAsRead() {
    const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id);

    if (unreadIds.length === 0) return;

    const { error } = await supabase
      .from("notifications")
      .update({
        read: true,
      })
      .in("id", unreadIds);

    if (error) {
      console.error(error);
      return;
    }

    setNotifications((prev) =>
      prev.map((n) => ({
        ...n,
        read: true,
      })),
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(true)}
        className="relative rounded-xl border border-zinc-700 bg-zinc-900 p-3 transition hover:bg-zinc-800"
      >
        <Bell size={22} className="text-white" />

        {unreadCount > 0 && (
          <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </div>
        )}
      </button>

      {open && (
        <>
          {/* MOBILE */}
          <div className="fixed inset-0 z-[9999] bg-zinc-950 lg:hidden">
            <div className="flex items-center justify-between border-b border-zinc-800 p-4">
              <h2 className="text-lg font-bold text-white">Notificações</h2>

              <button onClick={() => setOpen(false)} className="text-zinc-400">
                <X size={24} />
              </button>
            </div>

            {notifications.length > 0 && (
              <div className="border-b border-zinc-800 p-4">
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-blue-400"
                >
                  Marcar todas como lidas
                </button>
              </div>
            )}

            <div className="overflow-y-auto pb-24">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-zinc-400">
                  Nenhuma notificação
                </div>
              ) : (
                notifications.map((notification) => (
                  <button
                    key={notification.id}
                    onClick={() => markAsRead(notification.id)}
                    className={`w-full border-b border-zinc-800 p-4 text-left transition ${
                      !notification.read ? "bg-zinc-800/40" : ""
                    }`}
                  >
                    <h3 className="font-semibold text-white">
                      {notification.title}
                    </h3>

                    <p className="mt-1 text-sm text-zinc-400">
                      {notification.message}
                    </p>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* DESKTOP */}
          <div className="absolute right-0 z-50 mt-3 hidden w-96 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl lg:block">
            <div className="flex items-center justify-between border-b border-zinc-800 p-4">
              <h2 className="font-bold text-white">Notificações</h2>

              <button onClick={() => setOpen(false)} className="text-zinc-400">
                <X size={18} />
              </button>
            </div>

            {notifications.length > 0 && (
              <div className="border-b border-zinc-800 p-3">
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-blue-400"
                >
                  Marcar todas como lidas
                </button>
              </div>
            )}

            <div className="max-h-[500px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-zinc-400">
                  Nenhuma notificação
                </div>
              ) : (
                notifications.map((notification) => (
                  <button
                    key={notification.id}
                    onClick={() => markAsRead(notification.id)}
                    className={`w-full border-b border-zinc-800 p-4 text-left transition hover:bg-zinc-800 ${
                      !notification.read ? "bg-zinc-800/40" : ""
                    }`}
                  >
                    <h3 className="font-semibold text-white">
                      {notification.title}
                    </h3>

                    <p className="mt-1 text-sm text-zinc-400">
                      {notification.message}
                    </p>
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
