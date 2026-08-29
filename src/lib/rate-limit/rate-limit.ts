import { RateLimitError } from "@/lib/errors/errors";

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const memoryStore = new Map<string, RateLimitRecord>();

/**
 * In-memory sliding window rate limiter.
 * Cleans up stale keys periodically.
 */
export function rateLimit(
  key: string,
  limit = 5,
  windowMs = 60 * 1000 // 1 minute
): { success: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const record = memoryStore.get(key);

  // Periodic cleanup if map grows
  if (memoryStore.size > 5000) {
    for (const [k, v] of memoryStore.entries()) {
      if (v.resetAt < now) {
        memoryStore.delete(k);
      }
    }
  }

  if (!record || record.resetAt < now) {
    const newRecord: RateLimitRecord = {
      count: 1,
      resetAt: now + windowMs,
    };
    memoryStore.set(key, newRecord);
    return {
      success: true,
      remaining: limit - 1,
      resetAt: newRecord.resetAt,
    };
  }

  if (record.count >= limit) {
    return {
      success: false,
      remaining: 0,
      resetAt: record.resetAt,
    };
  }

  record.count += 1;
  return {
    success: true,
    remaining: limit - record.count,
    resetAt: record.resetAt,
  };
}

/**
 * Enforces rate limiting on a specific action key (e.g. IP + action).
 * Throws RateLimitError if limit is exceeded.
 */
export function enforceRateLimit(
  key: string,
  limit = 5,
  windowMs = 60 * 1000
): void {
  const result = rateLimit(key, limit, windowMs);
  if (!result.success) {
    throw new RateLimitError(
      `Rate limit exceeded. Please try again in ${Math.ceil(
        (result.resetAt - Date.now()) / 1000
      )} seconds.`
    );
  }
}
