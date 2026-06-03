/**
 * Storage abstraction using Vercel KV (Upstash Redis).
 *
 * Setup (one-time):
 *   1. Vercel dashboard → Storage → Create KV database → link to project.
 *   2. `vercel env pull .env.local` to get KV_REST_API_URL + KV_REST_API_TOKEN locally.
 *
 * Key schema:
 *   order:{id}          → Order object
 *   game:{orderId}      → GameSession object
 */

import { kv } from '@vercel/kv';
import { randomUUID } from 'crypto';

const ORDER_TTL_SECONDS = 60 * 60 * 24 * 90; // 90 days
const GAME_TTL_SECONDS = 60 * 60 * 24 * 7;   // 7 days

// ── Orders ─────────────────────────────────────────────────────────────────

/** @typedef {{ id:string, userId:string, productKey:string, players:number, playlistId:string|null, priceCents:number, originalPriceCents:number, status:'pending'|'paid'|'admin_granted'|'expired', stripeSessionId:string|null, createdAt:string, updatedAt:string }} Order */

export async function createOrder({ userId, productKey, players, playlistId, priceCents, originalPriceCents, status, stripeSessionId }) {
  const id = randomUUID();
  /** @type {Order} */
  const order = {
    id,
    userId,
    productKey,
    players,
    playlistId: playlistId || null,
    priceCents,
    originalPriceCents,
    status,
    stripeSessionId: stripeSessionId || null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  await kv.set(`order:${id}`, order, { ex: ORDER_TTL_SECONDS });
  return order;
}

/** @returns {Promise<Order|null>} */
export async function getOrder(orderId) {
  return kv.get(`order:${orderId}`);
}

/** @returns {Promise<Order|null>} */
export async function getOrderByStripeSession(stripeSessionId) {
  return kv.get(`stripe:${stripeSessionId}`);
}

export async function updateOrderStatus(orderId, status, extra = {}) {
  const order = await getOrder(orderId);
  if (!order) return null;
  const updated = { ...order, ...extra, status, updatedAt: new Date().toISOString() };
  await kv.set(`order:${orderId}`, updated, { ex: ORDER_TTL_SECONDS });
  return updated;
}

/** Index Stripe session ID → orderId for fast webhook lookup. */
export async function indexStripeSession(stripeSessionId, orderId) {
  await kv.set(`stripe:${stripeSessionId}`, orderId, { ex: ORDER_TTL_SECONDS });
}

// ── Game sessions ───────────────────────────────────────────────────────────

/** @typedef {{ id:string, orderId:string, userId:string, productKey:string, players:number, includesHost:boolean, includesPdfCards:boolean, grantedAt:string }} GameSession */

export async function createGameSession({ orderId, userId, productKey, players, includesHost, includesPdfCards }) {
  /** @type {GameSession} */
  const session = {
    id: randomUUID(),
    orderId,
    userId,
    productKey,
    players,
    includesHost,
    includesPdfCards,
    grantedAt: new Date().toISOString(),
  };
  await kv.set(`game:${orderId}`, session, { ex: GAME_TTL_SECONDS });
  return session;
}

/** @returns {Promise<GameSession|null>} */
export async function getGameSession(orderId) {
  return kv.get(`game:${orderId}`);
}
