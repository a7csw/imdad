import type { Request, Response, NextFunction } from 'express';

/**
 * Lightweight in-process response cache for public GET endpoints.
 * Each worker holds its own LRU-ish map bounded by MAX_ENTRIES. This is
 * intentionally stateless-across-workers — for a clustered deployment that
 * needs a shared cache, swap this out for a Redis-backed store.
 *
 * Cache key = method + originalUrl (query string included).
 * Bypass rules:
 *   - non-GET requests
 *   - requests carrying an Authorization header (user-specific payloads)
 *   - explicit `Cache-Control: no-cache` from client
 */

interface CachedResponse {
  body: unknown;
  expiresAt: number;
}

const MAX_ENTRIES = 500;
const store = new Map<string, CachedResponse>();

function setCached(key: string, body: unknown, ttlMs: number): void {
  if (store.size >= MAX_ENTRIES) {
    // Evict the oldest entry (Map preserves insertion order).
    const oldestKey = store.keys().next().value;
    if (oldestKey !== undefined) store.delete(oldestKey);
  }
  store.set(key, { body, expiresAt: Date.now() + ttlMs });
}

function getCached(key: string): unknown | undefined {
  const hit = store.get(key);
  if (!hit) return undefined;
  if (hit.expiresAt < Date.now()) {
    store.delete(key);
    return undefined;
  }
  // Refresh recency on hit.
  store.delete(key);
  store.set(key, hit);
  return hit.body;
}

export function clearCache(): void {
  store.clear();
}

/**
 * Cache JSON responses for the given TTL (seconds). Apply to public read routes
 * only — this middleware deliberately skips authenticated requests.
 */
export function cache(ttlSeconds: number) {
  const ttlMs = ttlSeconds * 1000;

  return function cacheMiddleware(req: Request, res: Response, next: NextFunction): void {
    if (req.method !== 'GET') return next();
    if (req.headers.authorization) return next();
    if (req.headers['cache-control'] === 'no-cache') return next();

    const key = `${req.method}:${req.originalUrl}`;
    const hit = getCached(key);
    if (hit !== undefined) {
      res.setHeader('X-Cache', 'HIT');
      res.setHeader('Cache-Control', `public, max-age=${ttlSeconds}`);
      res.json(hit);
      return;
    }

    res.setHeader('X-Cache', 'MISS');
    res.setHeader('Cache-Control', `public, max-age=${ttlSeconds}`);

    const originalJson = res.json.bind(res);
    res.json = (body: unknown) => {
      // Only cache successful responses.
      if (res.statusCode >= 200 && res.statusCode < 300) {
        setCached(key, body, ttlMs);
      }
      return originalJson(body);
    };

    next();
  };
}
