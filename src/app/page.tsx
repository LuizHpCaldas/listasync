import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <section className="mx-auto flex min-h-screen max-w-7xl flex-col items-center justify-center px-6 text-center">
        <div className="max-w-4xl">
          <span className="rounded-full border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm text-zinc-400">
            🛒 Organize suas compras de forma inteligente
          </span>

          <h1 className="mt-8 text-5xl font-black leading-tight md:text-7xl">
            Gerencie listas de compras com IA e colaboração em tempo real
          </h1>

          <p className="mx-auto mt-8 max-w-2xl text-lg text-zinc-400 md:text-xl">
            Crie listas, acompanhe gastos, compartilhe com sua família e tenha
            relatórios inteligentes sobre seu consumo mensal.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/login"
              className="rounded-2xl bg-white px-8 py-4 text-lg font-bold text-black transition hover:scale-105 hover:opacity-90"
            >
              Começar agora
            </Link>

            <Link
              href="/premium"
              className="rounded-2xl border border-zinc-700 bg-zinc-900 px-8 py-4 text-lg font-semibold transition hover:border-zinc-500 hover:bg-zinc-800"
            >
              Conhecer Premium
            </Link>
          </div>
        </div>

        <div className="mt-24 grid w-full max-w-6xl gap-6 md:grid-cols-3">
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
            <div className="text-4xl">📊</div>

            <h2 className="mt-5 text-2xl font-bold">Analytics Inteligente</h2>

            <p className="mt-3 text-zinc-400">
              Descubra onde você mais gasta e receba relatórios automáticos.
            </p>
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
            <div className="text-4xl">👨‍👩‍👧‍👦</div>

            <h2 className="mt-5 text-2xl font-bold">Compartilhamento</h2>

            <p className="mt-3 text-zinc-400">
              Compartilhe listas com família e amigos em tempo real.
            </p>
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
            <div className="text-4xl">⚡</div>

            <h2 className="mt-5 text-2xl font-bold">Rápido e Moderno</h2>

            <p className="mt-3 text-zinc-400">
              Interface moderna, responsiva e otimizada para celular.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
