import { NextResponse } from "next/server";
import orders from "@/app/data/orders.json";
import { confirmItem } from "@/app/lib/store";

export async function POST(req: Request) {
  const { email, item } = await req.json();
  const normalized = email.trim().toLowerCase();
  const order = orders.find((o) => o.email === normalized);
  if (!order) {
    return NextResponse.json({ error: "Email not found" }, { status: 404 });
  }
  if (!order.items[item as keyof typeof order.items]) {
    return NextResponse.json({ error: "Item not in order" }, { status: 400 });
  }
  const confirmed = await confirmItem(normalized, item);
  return NextResponse.json({ confirmed });
}
