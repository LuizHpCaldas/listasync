import { createClient } from "./supabase/client";

export async function createConversation(friendId: string) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: conversation } = await supabase
    .from("conversations")
    .insert({})
    .select()
    .single();

  if (!conversation) return null;

  await supabase.from("conversation_participants").insert([
    {
      conversation_id: conversation.id,
      user_id: user.id,
    },
    {
      conversation_id: conversation.id,
      user_id: friendId,
    },
  ]);

  return conversation.id;
}
