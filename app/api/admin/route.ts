import { NextResponse } from "next/server";
import orders from "@/app/data/orders.json";
import { getAllConfirmations } from "@/app/lib/store";

export async function POST(req: Request) {
  const { password } = await req.json();
  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const confirmations = await getAllConfirmations();
  const summary = orders.map((order) => ({
    ...order,
    confirmed: confirmations[order.email] || [],
    allConfirmed:
      Object.keys(order.items).length ===
      (confirmations[order.email] || []).length,
  }));
  return NextResponse.json({ summary });
}
