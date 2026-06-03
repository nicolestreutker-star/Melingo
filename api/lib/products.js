/**
 * Server-side product catalogue.
 * Prices and rules are defined here — NEVER sent from or trusted from the frontend.
 *
 * Admin en betaalstatus moeten altijd server-side gecontroleerd worden.
 * Frontend checks zijn alleen UI, nooit beveiliging.
 */

export const PRODUCTS = {
  ready_made_theme: {
    name: 'Kant-en-klaar thema',
    mode: 'ready_made',
    maxPlayers: 20,
    trackCount: 40,
    priceCents: 995,
    includesHost: true,
    includesPdfCards: true,
  },
  spotify_host_small: {
    name: 'Klein gezelschap',
    mode: 'spotify_host',
    maxPlayers: 25,
    priceCents: 1495,
    includesHost: true,
    includesPdfCards: true,
  },
  spotify_host_party: {
    name: 'Feest',
    mode: 'spotify_host',
    maxPlayers: 75,
    priceCents: 1995,
    includesHost: true,
    includesPdfCards: true,
  },
  spotify_host_event: {
    name: 'Evenement',
    mode: 'spotify_host',
    maxPlayers: 200,
    priceCents: 2995,
    includesHost: true,
    includesPdfCards: true,
  },
  cards_only_small: {
    name: 'Klein gezelschap',
    mode: 'cards_only',
    maxPlayers: 25,
    priceCents: 795,
    includesHost: false,
    includesPdfCards: true,
  },
  cards_only_party: {
    name: 'Feest',
    mode: 'cards_only',
    maxPlayers: 75,
    priceCents: 1295,
    includesHost: false,
    includesPdfCards: true,
  },
  cards_only_event: {
    name: 'Evenement',
    mode: 'cards_only',
    maxPlayers: 200,
    priceCents: 1995,
    includesHost: false,
    includesPdfCards: true,
  },
};

/** Format cents to readable euro string, e.g. 995 → "€9,95" */
export function formatPrice(cents) {
  return '€' + (cents / 100).toFixed(2).replace('.', ',');
}
