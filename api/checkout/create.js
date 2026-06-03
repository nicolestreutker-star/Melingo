/**
 * POST /api/checkout/create
 *
 * Creates a Stripe Checkout session (for normal users) or an admin grant
 * (for admins). All pricing and access rules are enforced server-side.
 *
 * Admin en betaalstatus moeten altijd server-side gecontroleerd worden.
 * Frontend checks zijn alleen UI, nooit beveiliging.
 *
 * Required env vars:
 *   STRIPE_SECRET_KEY
 *   STRIPE_PRICE_ID_*   (optional — can use ad-hoc price)
 *   SESSION_SECRET
 *   KV_REST_API_URL / KV_REST_API_TOKEN  (Vercel KV)
 *   NEXT_PUBLIC_BASE_URL  (e.g. https://melingo.vercel.app)
 */

import Stripe from 'stripe';
import { PRODUCTS } from '../lib/products.js';
import { isAdminUser } from '../lib/admin.js';
import { getSession } from '../lib/session.js';
import { createOrder, createGameSession, indexStripeSession } from '../lib/store.js';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://melingo.vercel.app';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // ── 1. Auth: session must exist ──────────────────────────────────────────
  const session = getSession(req);
  if (!session) {
    return res.status(401).json({ error: 'Niet ingelogd. Verbind eerst met Spotify.' });
  }
  const user = session; // { spotifyUserId }

  // ── 2. Parse and validate request body ───────────────────────────────────
  let body;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  } catch {
    return res.status(400).json({ error: 'Ongeldige request body.' });
  }

  const { productKey, players, playlistId, trackCount } = body || {};

  if (!productKey || typeof productKey !== 'string') {
    return res.status(400).json({ error: 'productKey ontbreekt.' });
  }

  const product = PRODUCTS[productKey];
  if (!product) {
    return res.status(400).json({ error: 'Onbekend product: ' + productKey });
  }

  const numPlayers = parseInt(players, 10);
  if (!Number.isInteger(numPlayers) || numPlayers < 1) {
    return res.status(400).json({ error: 'Ongeldig aantal spelers.' });
  }

  if (numPlayers > 200) {
    return res.status(400).json({ error: 'Meer dan 200 spelers vereist maatwerk. Neem contact op.' });
  }

  // trackCount is advisory — never used for pricing, but log a warning if too low.
  const numTracks = parseInt(trackCount, 10) || 0;
  const trackWarning = numTracks > 0 && numTracks < 25
    ? `Playlist heeft slechts ${numTracks} nummers. Minimaal 25 nodig voor een 5×5 kaart.`
    : null;

  const admin = isAdminUser(user);

  // Players may exceed product.maxPlayers only for admins (test any config).
  if (!admin && numPlayers > product.maxPlayers) {
    return res.status(400).json({
      error: `Dit pakket ondersteunt maximaal ${product.maxPlayers} spelers. Kies een groter pakket.`,
    });
  }

  // ── 3a. Admin grant ───────────────────────────────────────────────────────
  if (admin) {
    const order = await createOrder({
      userId: user.spotifyUserId,
      productKey,
      players: numPlayers,
      playlistId: playlistId || null,
      priceCents: 0,
      originalPriceCents: product.priceCents,
      status: 'admin_granted',
      stripeSessionId: null,
    });

    const gameSession = await createGameSession({
      orderId: order.id,
      userId: user.spotifyUserId,
      productKey,
      players: numPlayers,
      includesHost: product.includesHost,
      includesPdfCards: product.includesPdfCards,
    });

    return res.status(200).json({
      mode: 'admin_granted',
      message: 'Admin testmodus actief — betaling overgeslagen.',
      orderId: order.id,
      gameSessionId: gameSession.id,
      accessUrl: `${BASE_URL}/?order=${order.id}`,
      product: {
        name: product.name,
        maxPlayers: product.maxPlayers,
        includesHost: product.includesHost,
        includesPdfCards: product.includesPdfCards,
      },
      ...(trackWarning ? { warning: trackWarning } : {}),
    });
  }

  // ── 3b. Stripe Checkout ───────────────────────────────────────────────────
  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(500).json({ error: 'Stripe is niet geconfigureerd.' });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-04-10' });

  const order = await createOrder({
    userId: user.spotifyUserId,
    productKey,
    players: numPlayers,
    playlistId: playlistId || null,
    priceCents: product.priceCents,
    originalPriceCents: product.priceCents,
    status: 'pending',
    stripeSessionId: null,
  });

  const stripeSession = await stripe.checkout.sessions.create({
    payment_method_types: ['card', 'ideal'],
    mode: 'payment',
    line_items: [
      {
        price_data: {
          currency: 'eur',
          unit_amount: product.priceCents, // always server-side — never from frontend
          product_data: {
            name: `Melingo — ${product.name}`,
            description: `${numPlayers} spelers · ${product.includesHost ? 'inclusief host-scherm' : 'alleen PDF-kaarten'}`,
          },
        },
        quantity: 1,
      },
    ],
    metadata: {
      orderId: order.id,
      userId: user.spotifyUserId,
      productKey,
      mode: product.mode,
      players: String(numPlayers),
      playlistId: playlistId || '',
    },
    success_url: `${BASE_URL}/?order=${order.id}&payment=success`,
    cancel_url: `${BASE_URL}/?order=${order.id}&payment=cancelled`,
    locale: 'nl',
  });

  // Index Stripe session for fast webhook lookup.
  await indexStripeSession(stripeSession.id, order.id);

  // Update order with Stripe session ID.
  order.stripeSessionId = stripeSession.id;
  // (Store update is handled by indexStripeSession; full order already in KV.)

  return res.status(200).json({
    mode: 'checkout',
    checkoutUrl: stripeSession.url,
    orderId: order.id,
    ...(trackWarning ? { warning: trackWarning } : {}),
  });
}
