/**
 * Server-side admin authorisation.
 * Admin status is determined exclusively by the Spotify user ID stored in
 * the server-side session — never by any value supplied by the frontend.
 *
 * Admin en betaalstatus moeten altijd server-side gecontroleerd worden.
 * Frontend checks zijn alleen UI, nooit beveiliging.
 */

const ADMIN_SPOTIFY_IDS = ['21tbvinvqpc4rog4elcjp5uxa'];

/**
 * @param {{ spotifyUserId?: string }} user  Session user object (server-side only).
 * @returns {boolean}
 */
export function isAdminUser(user) {
  return !!(user?.spotifyUserId && ADMIN_SPOTIFY_IDS.includes(user.spotifyUserId));
}
