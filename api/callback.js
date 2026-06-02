// api/callback.js
export default async function handler(req, res) {
  const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
  const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
  const REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI;

  const code = req.query.code;
  const error = req.query.error;

  if (error || !code) {
    res.writeHead(302, { Location: '/?spotify_error=' + (error || 'no_code') });
    res.end();
    return;
  }

  try {
    const credentials = Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64');

    const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + credentials,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=authorization_code&code=' + encodeURIComponent(code) + '&redirect_uri=' + encodeURIComponent(REDIRECT_URI),
    });

    const data = await tokenRes.json();

    if (data.error || !data.access_token) {
      console.error('Spotify error:', data.error, data.error_description);
      res.writeHead(302, { Location: '/?spotify_error=' + (data.error || 'no_token') });
      res.end();
      return;
    }

    // Stuur HTML terug die tokens opslaat in localStorage en dan redirect
    // Dit werkt betrouwbaarder op mobiel dan query params meesturen
    const at = data.access_token;
    const rt = data.refresh_token || '';
    const ex = data.expires_in || 3600;

    const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Melingo</title></head>
<body>
<script>
try {
  var tokens = { accessToken: '${at}', refreshToken: '${rt}', expiresAt: Date.now() + ${ex} * 1000 };
  localStorage.setItem('sp_tokens', JSON.stringify(tokens));
} catch(e) {}
window.location.replace('/?sp_at=${encodeURIComponent(at)}&sp_rt=${encodeURIComponent(rt)}&sp_ex=${ex}');
</script>
<p>Verbinden met Melingo...</p>
</body>
</html>`;

    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(html);

  } catch (err) {
    console.error('Callback exception:', err.message);
    res.writeHead(302, { Location: '/?spotify_error=server_error' });
    res.end();
  }
}
