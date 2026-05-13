export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-zinc-950 p-6 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">Dashboard</h1>

            <p className="text-zinc-400">Gerencie suas listas de compras</p>
          </div>

          <button className="rounded-xl bg-white px-5 py-3 font-semibold text-black transition hover:opacity-90">
            + Nova Lista
          </button>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <p className="text-zinc-400">Total de listas</p>

            <h2 className="mt-2 text-4xl font-bold">0</h2>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <p className="text-zinc-400">Gasto mensal</p>

            <h2 className="mt-2 text-4xl font-bold">R$ 0,00</h2>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <p className="text-zinc-400">Economia estimada</p>

            <h2 className="mt-2 text-4xl font-bold text-green-400">R$ 0,00</h2>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="mb-4 text-2xl font-bold">Suas listas</h2>

          <div className="rounded-xl border border-dashed border-zinc-700 p-12 text-center">
            <p className="text-zinc-400">Nenhuma lista criada ainda.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
