interface Item {
  id: string;
  name: string;
  price: number | null;
  quantity: number;
  checked: boolean;
}

interface Props {
  item: Item;
  listStatus: "planning" | "shopping" | "completed";

  editingItem: string | null;
  editingName: string;
  editingQuantity: string;

  editingPrice: Record<string, string>;

  setEditingItem: (value: string | null) => void;
  setEditingName: (value: string) => void;
  setEditingQuantity: (value: string) => void;
  setEditingPrice: (value: Record<string, string>) => void;

  toggleChecked: (id: string, checked: boolean) => void;
  deleteItem: (id: string) => void;
  updateItem: (id: string) => void;
  updatePrice: (id: string, price: number) => void;
}

export default function ListCard({
  item,
  listStatus,
  editingItem,
  editingName,
  editingQuantity,
  editingPrice,
  setEditingItem,
  setEditingName,
  setEditingQuantity,
  setEditingPrice,
  toggleChecked,
  deleteItem,
  updateItem,
  updatePrice,
}: Props) {
  return (
    <div
      className={`rounded-2xl border border-zinc-800 bg-zinc-900 p-5 transition ${
        item.checked ? "opacity-60" : ""
      }`}
    >
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-4">
          <input
            type="checkbox"
            checked={item.checked}
            onChange={() => toggleChecked(item.id, item.checked)}
            className="mt-1 h-5 w-5"
          />

          <div className="flex-1">
            {editingItem === item.id ? (
              <div className="flex flex-col gap-3">
                <input
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  className="rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 outline-none"
                />

                <input
                  type="number"
                  value={editingQuantity}
                  onChange={(e) => setEditingQuantity(e.target.value)}
                  className="rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 outline-none"
                />

                <div className="flex gap-2">
                  <button
                    onClick={() => updateItem(item.id)}
                    className="rounded-xl bg-green-500 px-4 py-2 font-semibold text-black"
                  >
                    Salvar
                  </button>

                  <button
                    onClick={() => setEditingItem(null)}
                    className="rounded-xl bg-zinc-700 px-4 py-2 font-semibold text-white"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h2
                  className={`text-xl font-bold md:text-2xl ${
                    item.checked ? "line-through text-zinc-500" : ""
                  }`}
                >
                  {item.name}
                </h2>

                <p className="mt-1 text-zinc-400">
                  Quantidade: {item.quantity}
                </p>

                {listStatus === "planning" && (
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => {
                        setEditingItem(item.id);
                        setEditingName(item.name);
                        setEditingQuantity(String(item.quantity));
                      }}
                      className="rounded-xl bg-yellow-500 px-4 py-2 font-semibold text-black"
                    >
                      ✏️ Editar
                    </button>

                    <button
                      onClick={() => deleteItem(item.id)}
                      className="rounded-xl bg-red-500 px-4 py-2 font-semibold text-white"
                    >
                      🗑️ Remover
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <div className="w-full md:w-auto">
          {item.price ? (
            <div className="text-left md:text-right">
              <p className="text-sm text-zinc-400">Subtotal</p>

              <h2 className="text-2xl font-bold text-green-400 md:text-3xl">
                R$ {(item.price * item.quantity).toFixed(2)}
              </h2>
            </div>
          ) : listStatus === "shopping" ? (
            <div className="flex flex-col gap-3 md:flex-row">
              <input
                type="number"
                placeholder="Preço"
                value={editingPrice[item.id] || ""}
                onChange={(e) =>
                  setEditingPrice({
                    ...editingPrice,
                    [item.id]: e.target.value,
                  })
                }
                className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 outline-none md:w-28"
              />

              <button
                onClick={() => {
                  const value = editingPrice[item.id];

                  if (!value) return;

                  updatePrice(item.id, Number(value));

                  setEditingPrice({
                    ...editingPrice,
                    [item.id]: "",
                  });
                }}
                className="rounded-xl bg-green-500 px-5 py-3 font-semibold text-black transition hover:opacity-90"
              >
                Salvar
              </button>
            </div>
          ) : (
            <p className="text-zinc-500">Sem preço</p>
          )}
        </div>
      </div>
    </div>
  );
}
