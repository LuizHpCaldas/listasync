"use client";

import { Bell } from "lucide-react";

import { useCallback, useEffect, useState } from "react";

import { createClient } from "../lib/supabase/client";

interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

export default function NotificationBell() {
  const supabase = createClient();

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
      .order("created_at", {
        ascending: false,
      })
      .limit(20);

    if (error) {
      console.error(error);

      return;
    }

    setNotifications((data as Notification[]) || []);
  }, [supabase]);

  useEffect(() => {
    queueMicrotask(() => {
      loadNotifications();
    });
  }, [loadNotifications]);

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

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative rounded-xl border border-zinc-700 bg-zinc-900 p-3 transition hover:bg-zinc-800"
      >
        <Bell size={22} className="text-white" />

        {unreadCount > 0 && (
          <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
            {unreadCount}
          </div>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-3 w-80 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl">
          <div className="border-b border-zinc-800 p-4">
            <h2 className="font-bold text-white">Notificações</h2>
          </div>

          <div className="max-h-96 overflow-y-auto">
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
      )}
    </div>
  );
}
