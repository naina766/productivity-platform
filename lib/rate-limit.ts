/**
 * Simple in-memory rate limiter for Next.js Route Handlers.
 * Uses a sliding-window approach per IP + route key.
 * Production: replace with Upstash/Redis-backed implementation.
 */

interface RateLimitEntry {
  count: number;
  windowStart: number;
}

const store = new Map<string, RateLimitEntry>();

// Prune stale entries every 5 minutes.
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
      if (now - entry.windowStart > 15 * 60 * 1000) store.delete(key);
    }
  }, 5 * 60 * 1000);
}

/**
 * @param key     Unique identifier (e.g. `login:${ip}`)
 * @param limit   Maximum requests per window
 * @param windowMs Window duration in milliseconds
 * @returns true if the request is allowed, false if rate-limited
 */
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

/** Extract the client IP from a Next.js request. */
export function getClientIp(req: Request): string {
  const forwarded = (req as unknown as { headers: Headers }).headers.get('x-forwarded-for');
  return forwarded?.split(',')[0]?.trim() ?? 'unknown';
}
