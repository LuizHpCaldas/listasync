"use client";

import Link from "next/link";

interface Props {
  id: string;

  title: string;

  budget: number;

  ownerName?: string;

  shared?: boolean;

  status?: "planning" | "shopping" | "completed";
}

export default function ListCard({
  id,
  title,
  budget,
  ownerName,
  shared = false,
  status = "planning",
}: Props) {
  function getStatus() {
    switch (status) {
      case "shopping":
        return {
          label: "🛒 Comprando",
          className: "bg-yellow-500/20 text-yellow-300",
        };

      case "completed":
        return {
          label: "✅ Finalizada",
          className: "bg-green-500/20 text-green-300",
        };

      default:
        return {
          label: "🏠 Planejamento",
          className: "bg-zinc-800 text-zinc-300",
        };
    }
  }

  const statusData = getStatus();

  return (
    <Link href={`/lists/${id}`}>
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 transition hover:border-zinc-600 hover:bg-zinc-800">
        <div className="mb-4 flex items-center justify-between gap-3">
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${statusData.className}`}
          >
            {statusData.label}
          </span>

          {shared && (
            <span className="rounded-full bg-blue-500/20 px-3 py-1 text-xs text-blue-300">
              Compartilhada
            </span>
          )}
        </div>

        <h2 className="line-clamp-2 text-2xl font-bold">{title}</h2>

        {ownerName && (
          <p className="mt-2 text-sm text-zinc-400">Dono: {ownerName}</p>
        )}

        <div className="mt-6">
          <p className="text-sm text-zinc-400">Orçamento</p>

          <p className="mt-1 text-3xl font-bold text-green-400">
            R$ {Number(budget).toFixed(2)}
          </p>
        </div>
      </div>
    </Link>
  );
}
