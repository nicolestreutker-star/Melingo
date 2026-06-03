/**
 * Server-side session cookie management.
 *
 * Uses a signed JWT (jsonwebtoken) stored in an httpOnly cookie so the
 * Spotify user ID is never readable or forgeable by the browser.
 *
 * Required env var: SESSION_SECRET  (min 32 random chars)
 */

import jwt from 'jsonwebtoken';

const COOKIE_NAME = 'melo_session';
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

function secret() {
  if (!process.env.SESSION_SECRET) throw new Error('SESSION_SECRET env var missing');
  return process.env.SESSION_SECRET;
}

/** Create a signed session JWT containing the Spotify user ID. */
export function createSessionToken(spotifyUserId) {
  return jwt.sign({ spotifyUserId }, secret(), { expiresIn: MAX_AGE_SECONDS });
}

/** Set the session cookie on the response. */
export function setSessionCookie(res, spotifyUserId) {
  const token = createSessionToken(spotifyUserId);
  const cookieValue = [
    `${COOKIE_NAME}=${token}`,
    'Path=/',
    `Max-Age=${MAX_AGE_SECONDS}`,
    'HttpOnly',
    'SameSite=Lax',
    process.env.NODE_ENV !== 'development' ? 'Secure' : '',
  ]
    .filter(Boolean)
    .join('; ');
  res.setHeader('Set-Cookie', cookieValue);
}

/** Parse and verify the session cookie. Returns { spotifyUserId } or null. */
export function getSession(req) {
  try {
    const cookieHeader = req.headers.cookie || '';
    const match = cookieHeader.split(';').find((c) => c.trim().startsWith(COOKIE_NAME + '='));
    if (!match) return null;
    const token = match.trim().slice(COOKIE_NAME.length + 1);
    const payload = jwt.verify(token, secret());
    return { spotifyUserId: payload.spotifyUserId };
  } catch {
    return null;
  }
}
