/**
 * GET /api/orders/:orderId/access
 *
 * Returns the game session if the order is paid or admin_granted.
 * Always verifies server-side that the requesting user owns the order.
 *
 * Admin en betaalstatus moeten altijd server-side gecontroleerd worden.
 * Frontend checks zijn alleen UI, nooit beveiliging.
 */

import { getOrder, getGameSession } from '../../lib/store.js';
import { getSession } from '../../lib/session.js';
import { isAdminUser } from '../../lib/admin.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  // ── 1. Auth ───────────────────────────────────────────────────────────────
  const session = getSession(req);
  if (!session) return res.status(401).json({ error: 'Niet ingelogd.' });

  const { orderId } = req.query;
  if (!orderId) return res.status(400).json({ error: 'orderId ontbreekt.' });

  // ── 2. Load order ─────────────────────────────────────────────────────────
  const order = await getOrder(orderId);
  if (!order) return res.status(404).json({ error: 'Order niet gevonden.' });

  // ── 3. Authorisation: only owner or admin may access ──────────────────────
  const isOwner = order.userId === session.spotifyUserId;
  const isAdmin = isAdminUser(session);
  if (!isOwner && !isAdmin) return res.status(403).json({ error: 'Geen toegang.' });

  // ── 4. Payment status ─────────────────────────────────────────────────────
  if (order.status === 'pending') {
    return res.status(202).json({
      status: 'pending',
      message: 'Betaling wordt verwerkt. Vernieuw over enkele seconden.',
    });
  }

  if (order.status !== 'paid' && order.status !== 'admin_granted') {
    return res.status(403).json({ error: 'Betaling niet voltooid.' });
  }

  // ── 5. Return game session ────────────────────────────────────────────────
  const gameSession = await getGameSession(orderId);
  if (!gameSession) {
    return res.status(404).json({ error: 'Game session niet gevonden. Neem contact op.' });
  }

  return res.status(200).json({
    status: order.status,
    gameSession: {
      id: gameSession.id,
      productKey: gameSession.productKey,
      players: gameSession.players,
      includesHost: gameSession.includesHost,
      includesPdfCards: gameSession.includesPdfCards,
      grantedAt: gameSession.grantedAt,
    },
  });
}
