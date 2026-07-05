import { Redis } from "@upstash/redis";
import { verifyToken } from "./_verify.js";

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const token = req.body?.token;
  const data  = req.body?.data;

  const viewer = await verifyToken(token);
  if (!viewer) {
    return res.status(401).json({ error: "Invalid Annict token" });
  }

  if (typeof data !== "object" || data === null) {
    return res.status(400).json({ error: "Invalid data" });
  }

  try {
    // ユーザーIDをキーに丸ごと保存（@upstash/redis はオブジェクトをJSON化して保存）
    await redis.set(`animelog:${viewer.id}`, data);
    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: "Failed to save data" });
  }
}
