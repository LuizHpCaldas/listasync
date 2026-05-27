export default function SuccessPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
      <div className="rounded-3xl bg-zinc-900 p-10 text-center">
        <h1 className="text-4xl font-bold text-green-400">
          Pagamento aprovado!
        </h1>

        <p className="mt-4 text-zinc-400">
          Seu Premium será ativado em instantes.
        </p>
      </div>
    </main>
  );
}
