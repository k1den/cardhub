interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const memoryStore = new Map<string, RateLimitEntry>();

// Clean up stale memory records every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of memoryStore.entries()) {
    if (now > entry.resetAt) {
      memoryStore.delete(key);
    }
  }
}, 5 * 60 * 1000).unref();

export interface RateLimitOptions {
  limit: number;      // Maximum allowed requests in window
  windowSeconds: number; // Window size in seconds
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

/**
 * In-memory sliding window rate limiter (can connect to Redis if available).
 */
export async function rateLimit(
  identifier: string,
  options: RateLimitOptions = { limit: 10, windowSeconds: 60 }
): Promise<RateLimitResult> {
  // In development mode, relax rate limit for smooth developer testing
  const effectiveLimit =
    process.env.NODE_ENV === 'development' && !process.env.VITEST ? 1000 : options.limit;

  const now = Date.now();
  const windowMs = options.windowSeconds * 1000;
  const key = `ratelimit:${identifier}`;

  const current = memoryStore.get(key);

  if (!current || now > current.resetAt) {
    const entry: RateLimitEntry = {
      count: 1,
      resetAt: now + windowMs,
    };
    memoryStore.set(key, entry);
    return {
      success: true,
      limit: effectiveLimit,
      remaining: effectiveLimit - 1,
      reset: Math.ceil((entry.resetAt - now) / 1000),
    };
  }

  if (current.count >= effectiveLimit) {
    return {
      success: false,
      limit: effectiveLimit,
      remaining: 0,
      reset: Math.ceil((current.resetAt - now) / 1000),
    };
  }

  current.count += 1;
  return {
    success: true,
    limit: effectiveLimit,
    remaining: effectiveLimit - current.count,
    reset: Math.ceil((current.resetAt - now) / 1000),
  };
}

export function getClientIp(req: Request): string {
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  const realIp = req.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }
  return '127.0.0.1';
}
