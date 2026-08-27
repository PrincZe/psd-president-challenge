import { Redis } from "@upstash/redis";
import fs from "fs";
import path from "path";

const LOCAL_FILE = path.join(process.cwd(), "confirmations.json");

function getRedis(): Redis | null {
  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    return new Redis({
      url: process.env.KV_REST_API_URL,
      token: process.env.KV_REST_API_TOKEN,
    });
  }
  return null;
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
  const redis = getRedis();
  if (redis) {
    return (await redis.get<string[]>(`confirmations:${email}`)) || [];
  }
  const data = readLocal();
  return data[email] || [];
}

export async function confirmItem(
  email: string,
  item: string
): Promise<string[]> {
  const redis = getRedis();
  if (redis) {
    const current =
      (await redis.get<string[]>(`confirmations:${email}`)) || [];
    if (!current.includes(item)) {
      current.push(item);
      await redis.set(`confirmations:${email}`, current);
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
  const redis = getRedis();
  if (redis) {
    const keys = await redis.keys("confirmations:*");
    const result: Record<string, string[]> = {};
    for (const key of keys) {
      const email = key.replace("confirmations:", "");
      result[email] = (await redis.get<string[]>(key)) || [];
    }
    return result;
  }
  return readLocal();
}
