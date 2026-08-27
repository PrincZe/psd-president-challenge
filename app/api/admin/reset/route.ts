import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  const { password, email } = await req.json();
  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  if (email) {
    await supabase.from("confirmations").delete().eq("email", email);
  } else {
    await supabase.from("confirmations").delete().neq("id", 0);
  }
  return NextResponse.json({ ok: true });
}
