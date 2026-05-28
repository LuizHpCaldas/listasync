export default function LoadingDashboard() {
  return (
    <main className="min-h-screen bg-zinc-950 p-4 text-white md:p-6">
      <div className="mx-auto max-w-7xl animate-pulse">
        <div className="mb-8">
          <div className="h-10 w-64 rounded-xl bg-zinc-800" />

          <div className="mt-4 h-5 w-96 rounded-xl bg-zinc-800" />
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5"
            >
              <div className="h-4 w-24 rounded bg-zinc-800" />

              <div className="mt-4 h-10 w-20 rounded bg-zinc-800" />
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <div className="h-8 w-48 rounded bg-zinc-800" />

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="h-14 rounded-xl bg-zinc-800" />

            <div className="h-14 rounded-xl bg-zinc-800" />

            <div className="h-14 rounded-xl bg-zinc-800" />
          </div>
        </div>
      </div>
    </main>
  );
}
