import rateLimit from 'express-rate-limit';

/**
 * Rate limiter presets. All limits are per-IP using an in-process memory store.
 * NOTE: when running behind a cluster or multiple instances, swap the store
 * for a Redis-backed one (rate-limit-redis) so counters are shared.
 *
 * Limits are sized assuming burst-heavy read traffic (the marketplace is
 * read-dominant). Targeting ~1000 req/s aggregate with ~100 concurrent clients
 * means ~10 req/s per client on average — the `public` bucket has headroom
 * well above that to avoid punishing legitimate crawlers or SPA refreshes.
 */

// Global read bucket — generous; catches only true abuse.
export const publicLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 300, // 300 req/min/IP → ~5 req/s sustained
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: 'Too many requests, please slow down.' },
});

// Auth routes — protect against credential stuffing.
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20, // 20 attempts per 15 min per IP
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: 'Too many auth attempts, try again later.' },
  skipSuccessfulRequests: true, // don't count the happy path
});

// Write bucket (create/update/delete) — keep modest to protect the DB.
export const writeLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 60,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: 'Too many write requests, please slow down.' },
});
