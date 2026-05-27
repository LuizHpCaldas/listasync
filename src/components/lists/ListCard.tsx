"use client";

import Link from "next/link";

interface Props {
  id: string;
  title: string;
  budget: number;
  status?: "planning" | "shopping" | "completed";
}

export default function ListCard({ id, title, budget, status }: Props) {
  return (
    <Link href={`/lists/${id}`}>
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 transition hover:border-zinc-700 hover:bg-zinc-800">
        <div className="flex items-center justify-between">
          <span className="text-sm text-zinc-400">
            {status === "planning" && "🏠 Planejamento"}

            {status === "shopping" && "🛒 Comprando"}

            {status === "completed" && "✅ Finalizada"}
          </span>
        </div>

        <h2 className="mt-4 text-2xl font-bold text-white">{title}</h2>

        <p className="mt-3 text-zinc-400">Orçamento</p>

        <h3 className="text-3xl font-bold text-green-400">
          R$ {budget.toFixed(2)}
        </h3>
      </div>
    </Link>
  );
}
