/**
 * Minimal in-memory failed-attempt limiter.
 *
 * State lives in the memory of one server instance. That is enough for a
 * single Node server or `next dev`. On serverless hosting (e.g. Vercel) each
 * instance has its own counters, so use a shared store (Upstash Redis,
 * Vercel KV) for strict enforcement.
 */

type Entry = {
  failures: number;
  windowStart: number;
  lockedUntil: number;
};

const store = new Map<string, Entry>();

export type RateLimitOptions = {
  /** Failed attempts allowed inside the window before locking */
  maxFailures: number;
  /** Window length in ms */
  windowMs: number;
  /** Lock duration in ms once maxFailures is reached */
  lockMs: number;
};

function prune(now: number, windowMs: number) {
  if (store.size < 500) return;
  for (const [key, entry] of store) {
    if (entry.lockedUntil < now && now - entry.windowStart > windowMs) {
      store.delete(key);
    }
  }
}

/** Returns seconds until the key may try again, or 0 if allowed. */
export function getRetryAfterSeconds(key: string): number {
  const entry = store.get(key);
  if (!entry) return 0;
  const remaining = entry.lockedUntil - Date.now();
  return remaining > 0 ? Math.ceil(remaining / 1000) : 0;
}

/** Records a failed attempt. Returns seconds locked for (0 if not locked yet). */
export function recordFailure(key: string, options: RateLimitOptions): number {
  const now = Date.now();
  prune(now, options.windowMs);

  let entry = store.get(key);
  if (!entry || now - entry.windowStart > options.windowMs) {
    entry = { failures: 0, windowStart: now, lockedUntil: 0 };
  }

  entry.failures += 1;
  if (entry.failures >= options.maxFailures) {
    entry.lockedUntil = now + options.lockMs;
    entry.failures = 0;
    entry.windowStart = now;
  }

  store.set(key, entry);
  return getRetryAfterSeconds(key);
}

export function resetFailures(key: string) {
  store.delete(key);
}

export function getClientIp(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return headers.get('x-real-ip')?.trim() || 'unknown';
}
