/**
 * POST /api/stripe/webhook
 *
 * Receives Stripe events and unlocks orders on checkout.session.completed.
 * NEVER trusts the success_url — only this verified webhook grants access.
 *
 * Required env vars:
 *   STRIPE_SECRET_KEY
 *   STRIPE_WEBHOOK_SECRET   (from Stripe dashboard → Webhooks)
 *
 * Admin en betaalstatus moeten altijd server-side gecontroleerd worden.
 * Frontend checks zijn alleen UI, nooit beveiliging.
 */

import Stripe from 'stripe';
import { getOrder, getOrderByStripeSession, updateOrderStatus, createGameSession, getGameSession } from '../lib/store.js';
import { PRODUCTS } from '../lib/products.js';

// Disable Vercel's default body parser — Stripe needs the raw bytes to verify signature.
export const config = { api: { bodyParser: false } };

/** Accumulate raw request body from stream. */
function rawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end('Method not allowed');

  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return res.status(500).end('Stripe niet geconfigureerd');
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-04-10' });

  // ── 1. Verify Stripe signature (prevents forged webhooks) ─────────────────
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    const buf = await rawBody(req);
    event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Stripe signature verificatie mislukt:', err.message);
    return res.status(400).end('Webhook signature verificatie mislukt');
  }

  // ── 2. Only act on checkout.session.completed ─────────────────────────────
  if (event.type !== 'checkout.session.completed') {
    return res.status(200).json({ received: true });
  }

  const stripeSession = event.data.object;

  // Idempotency: skip if already processed.
  const orderId = stripeSession.metadata?.orderId;
  if (!orderId) {
    console.error('Webhook: geen orderId in Stripe metadata', stripeSession.id);
    return res.status(200).json({ received: true });
  }

  const order = await getOrder(orderId);
  if (!order) {
    console.error('Webhook: order niet gevonden', orderId);
    return res.status(200).json({ received: true });
  }

  if (order.status === 'paid') {
    // Already processed — idempotent.
    return res.status(200).json({ received: true });
  }

  // ── 3. Validate paid amount matches order ─────────────────────────────────
  const amountPaid = stripeSession.amount_total;
  if (amountPaid !== order.priceCents) {
    console.error(`Webhook: bedrag komt niet overeen — verwacht ${order.priceCents}, ontvangen ${amountPaid} | order ${orderId}`);
    return res.status(200).json({ received: true, warning: 'amount_mismatch' });
  }

  // ── 4. Mark order as paid ─────────────────────────────────────────────────
  await updateOrderStatus(orderId, 'paid', { stripeSessionId: stripeSession.id });

  // ── 5. Create game session ────────────────────────────────────────────────
  const existing = await getGameSession(orderId);
  if (!existing) {
    const product = PRODUCTS[order.productKey];
    if (product) {
      await createGameSession({
        orderId,
        userId: order.userId,
        productKey: order.productKey,
        players: order.players,
        includesHost: product.includesHost,
        includesPdfCards: product.includesPdfCards,
      });
    }
  }

  console.log(`Webhook: order ${orderId} betaald en game session aangemaakt`);
  return res.status(200).json({ received: true });
}
