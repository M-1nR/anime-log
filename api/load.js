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

  // リクエストボディからトークンを取得
  const token = req.body?.token;
  const viewer = await verifyToken(token);
  if (!viewer) {
    return res.status(401).json({ error: "Invalid Annict token" });
  }

  try {
    // ユーザーIDをキーにデータを読み込む
    const data = await redis.get(`animelog:${viewer.id}`);
    // @upstash/redis はJSONを自動でパースして返す
    return res.status(200).json({ data: data ?? {} });
  } catch (e) {
    return res.status(500).json({ error: "Failed to load data" });
  }
}
