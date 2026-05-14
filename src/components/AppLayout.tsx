"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "../lib/supabase/client";
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  User,
  LogOut,
} from "lucide-react";

interface Props {
  children: React.ReactNode;
}

export default function AppLayout({ children }: Props) {
  const pathname = usePathname();

  const router = useRouter();

  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();

    router.push("/login");
  }

  const navItems = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      href: "/dashboard",
      label: "Listas",
      icon: ShoppingCart,
    },
    {
      href: "/dashboard",
      label: "Compartilhadas",
      icon: Users,
    },
    {
      href: "/profile",
      label: "Perfil",
      icon: User,
    },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <aside className="fixed left-0 top-0 hidden h-screen w-72 border-r border-zinc-800 bg-zinc-900 lg:flex lg:flex-col">
        <div className="border-b border-zinc-800 p-8">
          <h1 className="text-3xl font-bold">ListaSync</h1>

          <p className="mt-2 text-sm text-zinc-400">Compras inteligentes</p>
        </div>

        <nav className="flex-1 space-y-2 p-4">
          {navItems.map((item) => {
            const Icon = item.icon;

            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
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

      <div className="lg:pl-72">{children}</div>

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-800 bg-zinc-900/95 backdrop-blur lg:hidden">
        <div className="flex items-center justify-around py-3">
          {navItems.map((item) => {
            const Icon = item.icon;

            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
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
