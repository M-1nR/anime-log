// 画像プロキシ: CORS非対応の外部画像を自ドメイン経由で取得する
// Canvas出力（toDataURL）はCORSヘッダー付きの画像しか扱えないため、
// AniList以外の画像（Annict REST/OGP由来の外部サイト画像）はここを経由する

export default async function handler(req, res) {
  const url = req.query?.url;
  if (!url || typeof url !== "string") {
    return res.status(400).send("Missing url");
  }
  let parsed;
  try { parsed = new URL(url); } catch { return res.status(400).send("Invalid url"); }
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    return res.status(400).send("Invalid protocol");
  }

  try {
    const r = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; AnimeLog/1.0)" },
    });
    if (!r.ok) return res.status(502).send("Fetch failed");

    const ct = r.headers.get("content-type") || "";
    if (!ct.startsWith("image/")) return res.status(400).send("Not an image");

    const buf = Buffer.from(await r.arrayBuffer());
    res.setHeader("Content-Type", ct);
    res.setHeader("Access-Control-Allow-Origin", "*");
    // 1日エッジキャッシュで外部サイトへの負荷を抑える
    res.setHeader("Cache-Control", "s-maxage=86400, stale-while-revalidate=604800");
    return res.status(200).send(buf);
  } catch {
    return res.status(502).send("Fetch error");
  }
}
