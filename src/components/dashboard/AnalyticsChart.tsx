"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

interface Props {
  planning: number;
  shopping: number;
  completed: number;
}

const COLORS = ["#3b82f6", "#eab308", "#22c55e"];

export default function AnalyticsChart({
  planning,
  shopping,
  completed,
}: Props) {
  const data = [
    {
      name: "Planejamento",
      value: planning,
    },
    {
      name: "Comprando",
      value: shopping,
    },
    {
      name: "Finalizadas",
      value: completed,
    },
  ];

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Analytics</h2>

        <p className="mt-1 text-zinc-400">Distribuição das listas</p>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" outerRadius={110}>
              {data.map((entry, index) => (
                <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>

            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 grid gap-3">
        <div className="flex items-center justify-between rounded-xl bg-zinc-800 p-4">
          <span className="text-zinc-300">🏠 Planejamento</span>

          <strong>{planning}</strong>
        </div>

        <div className="flex items-center justify-between rounded-xl bg-zinc-800 p-4">
          <span className="text-zinc-300">🛒 Comprando</span>

          <strong>{shopping}</strong>
        </div>

        <div className="flex items-center justify-between rounded-xl bg-zinc-800 p-4">
          <span className="text-zinc-300">✅ Finalizadas</span>

          <strong>{completed}</strong>
        </div>
      </div>
    </div>
  );
}
