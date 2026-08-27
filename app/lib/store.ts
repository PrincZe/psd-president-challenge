import { kv } from "@vercel/kv";
import fs from "fs";
import path from "path";

const LOCAL_FILE = path.join(process.cwd(), "confirmations.json");

function isVercelKV(): boolean {
  return !!process.env.KV_REST_API_URL;
}

function readLocal(): Record<string, string[]> {
  try {
    return JSON.parse(fs.readFileSync(LOCAL_FILE, "utf-8"));
  } catch {
    return {};
  }
}

function writeLocal(data: Record<string, string[]>) {
  fs.writeFileSync(LOCAL_FILE, JSON.stringify(data, null, 2));
}

export async function getConfirmations(email: string): Promise<string[]> {
  if (isVercelKV()) {
    return (await kv.get<string[]>(`confirmations:${email}`)) || [];
  }
  const data = readLocal();
  return data[email] || [];
}

export async function confirmItem(
  email: string,
  item: string
): Promise<string[]> {
  if (isVercelKV()) {
    const current =
      (await kv.get<string[]>(`confirmations:${email}`)) || [];
    if (!current.includes(item)) {
      current.push(item);
      await kv.set(`confirmations:${email}`, current);
    }
    return current;
  }
  const data = readLocal();
  if (!data[email]) data[email] = [];
  if (!data[email].includes(item)) data[email].push(item);
  writeLocal(data);
  return data[email];
}

export async function getAllConfirmations(): Promise<
  Record<string, string[]>
> {
  if (isVercelKV()) {
    const keys = await kv.keys("confirmations:*");
    const result: Record<string, string[]> = {};
    for (const key of keys) {
      const email = key.replace("confirmations:", "");
      result[email] = (await kv.get<string[]>(key)) || [];
    }
    return result;
  }
  return readLocal();
}
