/**
 * Fixed-window rate limiter held in the Node process memory.
 *
 * State is per server instance, so this protects a single container and does
 * not coordinate across replicas. Swap in a shared store (Redis/Upstash) when
 * the app is scaled horizontally.
 */
interface RateLimitEntry {
  count: number;
  windowStart: number;
}

const WINDOW_PRUNE_MS = 15 * 60 * 1000;
const store = new Map<string, RateLimitEntry>();

// Drop counters that can no longer be under load, otherwise the map grows
// without bound over the lifetime of the process.
setInterval(() => {
  const cutoff = Date.now() - WINDOW_PRUNE_MS;
  for (const [key, entry] of store) {
    if (entry.windowStart < cutoff) store.delete(key);
  }
}, 5 * 60 * 1000);

/** Returns false once `limit` requests have been made inside `windowMs`. */
export function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now - entry.windowStart > windowMs) {
    store.set(key, { count: 1, windowStart: now });
    return true;
  }

  if (entry.count >= limit) return false;

  entry.count += 1;
  return true;
}

/** First hop in X-Forwarded-For is the originating client behind a proxy. */
export function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  return forwarded?.split(',')[0]?.trim() || 'unknown';
}
