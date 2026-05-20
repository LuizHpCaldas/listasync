import { Item } from "../../types/item";

type Props = {
  item: Item;
  listStatus: string;

  onToggle: () => void;
  onDelete: () => void;
};

export default function ItemRow({
  item,
  listStatus,
  onToggle,
  onDelete,
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
            onChange={onToggle}
            className="mt-1 h-5 w-5"
          />

          <div>
            <h2
              className={`text-xl font-bold md:text-2xl ${
                item.checked ? "line-through text-zinc-500" : ""
              }`}
            >
              {item.name}
            </h2>

            <p className="mt-1 text-zinc-400">Quantidade: {item.quantity}</p>

            {listStatus === "planning" && (
              <div className="mt-4">
                <button
                  onClick={onDelete}
                  className="rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white"
                >
                  🗑️ Remover
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="w-full md:w-auto">
          {item.price ? (
            <div className="text-left md:text-right">
              <p className="text-sm text-zinc-400">Subtotal</p>

              <h2 className="text-2xl font-bold text-green-400 md:text-3xl">
                R$
                {(item.price * item.quantity).toFixed(2)}
              </h2>
            </div>
          ) : (
            <p className="text-zinc-500">Sem preço</p>
          )}
        </div>
      </div>
    </div>
  );
}
