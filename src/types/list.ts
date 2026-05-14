export interface ShoppingList {
  id: string;
  title: string;
  budget: number;
  owner_id: string;
  status: "planning" | "shopping" | "completed";
  created_at: string;
}
