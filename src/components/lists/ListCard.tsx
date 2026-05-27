"use client";

import Link from "next/link";

interface Props {
  id: string;
  title: string;
  budget: number;
  status?: "planning" | "shopping" | "completed";
}

export default function ListCard({
  id,
  title,
  budget,
  status = "planning",
}: Props) {
  return (
    <Link href={`/lists/${id}`} className="block">
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 transition hover:border-zinc-700 hover:bg-zinc-800 hover:scale-[1.01]">
        <div className="flex items-center justify-between">
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              status === "planning"
                ? "bg-blue-500/20 text-blue-400"
                : status === "shopping"
                  ? "bg-yellow-500/20 text-yellow-400"
                  : "bg-green-500/20 text-green-400"
            }`}
          >
            {status === "planning" && "🏠 Planejamento"}

            {status === "shopping" && "🛒 Comprando"}

            {status === "completed" && "✅ Finalizada"}
          </span>
        </div>

        <h2 className="mt-4 line-clamp-2 text-2xl font-bold text-white">
          {title}
        </h2>

        <div className="mt-6">
          <p className="text-sm text-zinc-400">Orçamento</p>

          <h3 className="mt-1 text-3xl font-bold text-green-400">
            R$ {Number(budget).toFixed(2)}
          </h3>
        </div>
      </div>
    </Link>
  );
}
