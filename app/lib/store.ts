import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function getConfirmations(email: string): Promise<string[]> {
  const supabase = getSupabase();
  const { data } = await supabase
    .from("confirmations")
    .select("item")
    .eq("email", email);
  return (data || []).map((row) => row.item);
}

export async function confirmItem(
  email: string,
  item: string
): Promise<string[]> {
  const supabase = getSupabase();
  await supabase
    .from("confirmations")
    .upsert({ email, item }, { onConflict: "email,item" });
  return getConfirmations(email);
}

export async function getAllConfirmations(): Promise<
  Record<string, string[]>
> {
  const supabase = getSupabase();
  const { data } = await supabase.from("confirmations").select("email, item");
  const result: Record<string, string[]> = {};
  for (const row of data || []) {
    if (!result[row.email]) result[row.email] = [];
    result[row.email].push(row.item);
  }
  return result;
}
