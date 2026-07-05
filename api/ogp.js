// Annict作品ページのog:imageを抽出する最終フォールバック
// AniListでも画像が見つからなかった作品のみクライアントから呼ばれる
// エッジキャッシュ(1日)でAnnictへのリクエストを最小限に抑える

export default async function handler(req, res) {
  const id = req.query?.id;
  if (!id || !/^\d+$/.test(String(id))) {
    return res.status(400).json({ error: "Invalid id" });
  }

  try {
    const r = await fetch(`https://annict.com/works/${id}`, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; AnimeLog/1.0)" },
    });
    if (!r.ok) {
      res.setHeader("Cache-Control", "s-maxage=3600");
      return res.status(200).json({ image: null });
    }
    const html = await r.text();
    // og:image メタタグを抽出（属性順の違いに両対応）
    const m =
      html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
    const image = m ? m[1] : null;

    // 1日エッジキャッシュ
    res.setHeader("Cache-Control", "s-maxage=86400, stale-while-revalidate=604800");
    return res.status(200).json({ image });
  } catch {
    return res.status(200).json({ image: null });
  }
}
