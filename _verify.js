// Annictトークンを検証し、viewerのIDを返す共通処理
// クライアントから送られたIDを信用せず、必ずトークンから引き直すことで詐称を防ぐ

export async function verifyToken(token) {
  if (!token || typeof token !== "string") return null;
  try {
    const r = await fetch("https://api.annict.com/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ query: "query { viewer { id username } }" }),
    });
    if (!r.ok) return null;
    const j = await r.json();
    const viewer = j?.data?.viewer;
    if (!viewer?.id) return null;
    return { id: String(viewer.id), username: viewer.username ?? null };
  } catch {
    return null;
  }
}
