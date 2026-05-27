import { createClient } from "./supabase/client";

export async function canShareLists() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return false;

  const { data } = await supabase
    .from("profiles")
    .select("is_premium")
    .eq("id", user.id)
    .single();

  return data?.is_premium === true;
}
