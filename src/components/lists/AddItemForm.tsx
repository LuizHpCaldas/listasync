type Props = {
  name: string;
  quantity: string;
  loading: boolean;

  onNameChange: (value: string) => void;
  onQuantityChange: (value: string) => void;
  onSubmit: () => void;
};

export default function AddItemForm({
  name,
  quantity,
  loading,
  onNameChange,
  onQuantityChange,
  onSubmit,
}: Props) {
  return (
    <div className="mb-8 rounded-2xl border border-zinc-800 bg-zinc-900 p-5 md:p-6">
      <h2 className="mb-6 text-2xl font-bold">Adicionar item</h2>

      <div className="flex flex-col gap-4 md:grid md:grid-cols-3">
        <input
          type="text"
          placeholder="Nome do item"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          className="rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-4 outline-none transition focus:border-zinc-500"
        />

        <input
          type="number"
          placeholder="Quantidade"
          value={quantity}
          onChange={(e) => onQuantityChange(e.target.value)}
          className="rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-4 outline-none transition focus:border-zinc-500"
        />

        <button
          onClick={onSubmit}
          disabled={loading}
          className="rounded-xl bg-white px-4 py-4 font-semibold text-black transition hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Adicionando..." : "Adicionar"}
        </button>
      </div>
    </div>
  );
}
