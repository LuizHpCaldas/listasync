export default function CancelPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
      <div className="rounded-3xl bg-zinc-900 p-10 text-center">
        <h1 className="text-4xl font-bold text-red-400">Pagamento cancelado</h1>

        <p className="mt-4 text-zinc-400">
          Você pode tentar novamente quando quiser.
        </p>
      </div>
    </main>
  );
}
