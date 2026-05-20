import { createClient } from "../lib/supabase/client";

const supabase = createClient();

export async function fetchItems(listId: string) {
  const { data, error } = await supabase
    .from("items")
    .select("*")
    .eq("list_id", listId)
    .order("created_at", {
      ascending: false,
    });

  if (error) throw error;

  return (data || []).map((item) => ({
    id: item.id,
    name: item.name,
    price: item.price,
    quantity: item.quantity ?? 1,
    checked: item.checked ?? false,
  }));
}

export async function createItem(
  listId: string,
  name: string,
  quantity: number,
) {
  const { error } = await supabase.from("items").insert({
    list_id: listId,
    name,
    quantity,
  });

  if (error) throw error;
}

export async function deleteItem(itemId: string) {
  const { error } = await supabase.from("items").delete().eq("id", itemId);

  if (error) throw error;
}

export async function updateItem(
  itemId: string,
  data: {
    name?: string;
    quantity?: number;
    checked?: boolean;
    price?: number;
  },
) {
  const { error } = await supabase.from("items").update(data).eq("id", itemId);

  if (error) throw error;
}
