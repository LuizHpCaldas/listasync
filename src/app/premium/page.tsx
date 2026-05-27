"use client";

import AppLayout from "../../components/AppLayout";

export default function PremiumPage() {
  async function handleCheckout() {
    const response = await fetch("/api/stripe/checkout", {
      method: "POST",
    });

    const data = await response.json();

    if (data.url) {
      window.location.href = data.url;
    }
  }

  return (
    <AppLayout>
      <main className="min-h-screen bg-zinc-950 p-6 text-white">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-3xl border border-yellow-500/20 bg-zinc-900 p-10">
            <h1 className="text-5xl font-bold">ListaSync Premium</h1>

            <p className="mt-4 text-xl text-zinc-400">
              Compartilhe listas, colaboração em tempo real, relatórios
              inteligentes e muito mais.
            </p>

            <div className="mt-8 space-y-4">
              <div className="rounded-2xl bg-zinc-800 p-4">
                ✅ Compartilhar listas
              </div>

              <div className="rounded-2xl bg-zinc-800 p-4">
                ✅ Uso colaborativo
              </div>

              <div className="rounded-2xl bg-zinc-800 p-4">
                ✅ Relatórios IA
              </div>

              <div className="rounded-2xl bg-zinc-800 p-4">
                ✅ Analytics avançado
              </div>
            </div>

            <button
              onClick={handleCheckout}
              className="mt-10 w-full rounded-2xl bg-yellow-500 px-6 py-5 text-xl font-bold text-black transition hover:opacity-90"
            >
              ✨ Assinar Premium
            </button>
          </div>
        </div>
      </main>
    </AppLayout>
  );
}
