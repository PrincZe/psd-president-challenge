import { NextResponse } from "next/server";
import orders from "@/app/data/orders.json";
import { getConfirmations } from "@/app/lib/store";

export async function POST(req: Request) {
  const { email } = await req.json();
  const normalized = email.trim().toLowerCase();
  const order = orders.find((o) => o.email === normalized);
  if (!order) {
    return NextResponse.json({ error: "Email not found" }, { status: 404 });
  }
  const confirmed = await getConfirmations(normalized);
  return NextResponse.json({ order, confirmed });
}
