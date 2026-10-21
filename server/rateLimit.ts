/**
 * A small sliding-window limiter kept in memory.
 * Serverless instances come and go, so this is a second layer behind Netlify's platform rate limit
 * (configured on the function). Keys are hashed before they are stored, and expired keys are
 * dropped every few minutes.
 */
export interface RateRule {
  limit: number;
  windowMs: number;
}

const PRUNE_EVERY_MS = 5 * 60 * 1000;

export class MemoryRateLimiter {
  private hits = new Map<string, { windowMs: number; at: number[] }>();
  private lastPrune: number;

  constructor(private readonly now: () => number = Date.now) {
    this.lastPrune = now();
  }

  /** Records a hit and returns false if the key is over its limit. */
  allow(key: string, rule: RateRule): boolean {
    const t = this.now();
    if (t - this.lastPrune > PRUNE_EVERY_MS) this.prune(t);
    const since = t - rule.windowMs;
    const list = (this.hits.get(key)?.at ?? []).filter((at) => at > since);
    if (list.length >= rule.limit) {
      this.hits.set(key, { windowMs: rule.windowMs, at: list });
      return false;
    }
    list.push(t);
    this.hits.set(key, { windowMs: rule.windowMs, at: list });
    return true;
  }

  /** How many keys are currently remembered (for tests). */
  get size(): number {
    return this.hits.size;
  }

  private prune(t: number) {
    this.lastPrune = t;
    for (const [key, entry] of this.hits) {
      const fresh = entry.at.filter((at) => at > t - entry.windowMs);
      if (fresh.length) this.hits.set(key, { ...entry, at: fresh });
      else this.hits.delete(key);
    }
  }
}

export async function hashKey(value: string, salt: string): Promise<string> {
  const data = new TextEncoder().encode(`${salt}:${value.toLowerCase()}`);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest).slice(0, 16), (b) => b.toString(16).padStart(2, '0')).join('');
}
