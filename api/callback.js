// Annictからの認可コールバック
// 認可コードをアクセストークンに交換し、URLフラグメントに載せてトップへ戻す
// クライアントシークレットを使うため、この処理は必ずサーバー側で行う

export default async function handler(req, res) {
  const code = req.query?.code;
  if (!code) {
    return res.redirect(302, "/#login_error=missing_code");
  }

  const redirectUri = `https://${req.headers.host}/api/callback`;

  try {
    const r = await fetch("https://annict.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: process.env.ANNICT_CLIENT_ID,
        client_secret: process.env.ANNICT_CLIENT_SECRET,
        grant_type: "authorization_code",
        redirect_uri: redirectUri,
        code,
      }),
    });

    if (!r.ok) {
      return res.redirect(302, "/#login_error=token_exchange_failed");
    }

    const j = await r.json();
    const token = j?.access_token;
    if (!token) {
      return res.redirect(302, "/#login_error=no_token");
    }

    // フラグメント(#)はサーバーやアクセスログに送信されないため、
    // クエリパラメータよりトークンの露出が少ない
    return res.redirect(302, `/#annict_token=${encodeURIComponent(token)}`);
  } catch {
    return res.redirect(302, "/#login_error=exception");
  }
}
