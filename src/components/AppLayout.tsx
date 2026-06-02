"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "../lib/supabase/client";

import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  User,
  LogOut,
  Store,
} from "lucide-react";

import NotificationBell from "./NotificationBell";

interface Props {
  children: React.ReactNode;
}

interface Profile {
  full_name: string | null;
  avatar_url: string | null;
}

export default function AppLayout({ children }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const [profile, setProfile] = useState<Profile | null>(null);

  const loadProfile = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data, error } = await supabase
      .from("profiles")
      .select("full_name, avatar_url")
      .eq("id", user.id)
      .maybeSingle();

    if (error) {
      console.error(error);
      return;
    }

    if (data) {
      setProfile(data);
    }
  }, [supabase]);

  useEffect(() => {
    queueMicrotask(() => {
      void loadProfile();
    });
  }, [loadProfile]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  const navItems = [
    {
      id: "dashboard",
      href: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      id: "listas",
      href: "/lists",
      label: "Listas",
      icon: ShoppingCart,
    },
    {
      id: "mercados",
      href: "/supermarkets",
      label: "Mercados",
      icon: Store,
    },
    {
      id: "shared",
      href: "/shared",
      label: "Compartilhadas",
      icon: Users,
    },
    {
      id: "perfil",
      href: "/profile",
      label: "Perfil",
      icon: User,
    },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Sidebar Desktop */}
      <aside className="fixed left-0 top-0 hidden h-screen w-72 border-r border-zinc-800 bg-zinc-900 lg:flex lg:flex-col">
        <div className="border-b border-zinc-800 p-8">
          <h1 className="text-3xl font-bold">ListaSync</h1>

          <p className="mt-2 text-sm text-zinc-400">Compras inteligentes</p>

          <div className="mt-6 flex items-center gap-4 rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
            <div className="relative h-14 w-14 overflow-hidden rounded-full bg-zinc-800">
              {profile?.avatar_url ? (
                <Image
                  src={profile.avatar_url}
                  alt="Avatar"
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-2xl">
                  👤
                </div>
              )}
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm text-zinc-400">Bem-vindo</p>

              <h2 className="truncate text-lg font-bold">
                {profile?.full_name || "Usuário"}
              </h2>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-2 p-4">
          {navItems.map((item) => {
            const Icon = item.icon;

            const active =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.id}
                href={item.href}
                className={`flex items-center gap-4 rounded-2xl px-5 py-4 transition ${
                  active
                    ? "bg-white text-black"
                    : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                }`}
              >
                <Icon size={22} />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-zinc-800 p-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-4 rounded-2xl px-5 py-4 text-zinc-400 transition hover:bg-red-500 hover:text-white"
          >
            <LogOut size={22} />
            <span>Sair</span>
          </button>
        </div>
      </aside>

      {/* Conteúdo */}
      <div className="lg:pl-72">
        {/* Topbar */}
        <header className="sticky top-0 z-40 flex justify-end border-b border-zinc-800 bg-zinc-950/80 p-4 backdrop-blur">
          <NotificationBell />
        </header>

        <main>{children}</main>
      </div>

      {/* Navegação Mobile */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-800 bg-zinc-900/95 backdrop-blur lg:hidden">
        <div className="flex items-center justify-around py-3">
          {navItems.map((item) => {
            const Icon = item.icon;

            const active =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={`mobile-${item.id}`}
                href={item.href}
                className={`flex flex-col items-center gap-1 px-3 py-2 text-xs transition ${
                  active ? "text-white" : "text-zinc-500"
                }`}
              >
                <Icon size={22} />
                <span>{item.label}</span>
              </Link>
            );
          })}

          <button
            onClick={handleLogout}
            className="flex flex-col items-center gap-1 px-3 py-2 text-xs text-zinc-500"
          >
            <LogOut size={22} />
            <span>Sair</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
