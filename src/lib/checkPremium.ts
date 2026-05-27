import { createClient } from "./supabase/client";

export async function checkPremium() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return false;

  const { data, error } = await supabase
    .from("profiles")
    .select("is_premium")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    console.error(error);

    return false;
  }

  return data?.is_premium ?? false;
}
