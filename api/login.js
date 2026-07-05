// 「Annictでログイン」ボタンの遷移先
// Annictの認可ページへリダイレクトする
// クライアントIDは環境変数から読むため、HTMLに書く必要がない

export default function handler(req, res) {
  const clientId = process.env.ANNICT_CLIENT_ID;
  if (!clientId) {
    return res.status(500).send("ANNICT_CLIENT_ID is not configured");
  }
  const redirectUri = `https://${req.headers.host}/api/callback`;
  const url =
    "https://annict.com/oauth/authorize" +
    `?client_id=${encodeURIComponent(clientId)}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    "&response_type=code" +
    "&scope=read";
  res.redirect(302, url);
}
