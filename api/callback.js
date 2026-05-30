// api/callback.js
// Receives auth code from Spotify, exchanges for access + refresh tokens

export default async function handler(req, res) {
  const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
  const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
  const REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI;

  const { code, error } = req.query;

  if (error || !code) {
    return res.redirect(`/?spotify_error=${error || 'no_code'}`);
  }

  try {
    const credentials = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');

    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: REDIRECT_URI,
      }).toString(),
    });

    const data = await response.json();

    if (data.error) {
      return res.redirect(`/?spotify_error=${data.error}`);
    }

    // Pass tokens to the frontend via URL fragment (never in query string)
    const fragment = new URLSearchParams({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_in: data.expires_in,
    });

    res.redirect(`/#spotify_auth=${encodeURIComponent(fragment.toString())}`);
  } catch (err) {
    res.redirect(`/?spotify_error=server_error`);
  }
}
