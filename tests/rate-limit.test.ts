import { describe, it, expect } from 'vitest';
import { rateLimit } from '@/lib/security/rate-limit';

describe('Sliding Window Rate Limiter', () => {
  it('allows requests within limit and blocks when exceeded', async () => {
    const testId = `test-client-${Date.now()}`;
    const options = { limit: 3, windowSeconds: 10 };

    const res1 = await rateLimit(testId, options);
    expect(res1.success).toBe(true);
    expect(res1.remaining).toBe(2);

    const res2 = await rateLimit(testId, options);
    expect(res2.success).toBe(true);
    expect(res2.remaining).toBe(1);

    const res3 = await rateLimit(testId, options);
    expect(res3.success).toBe(true);
    expect(res3.remaining).toBe(0);

    // 4th request should be blocked
    const res4 = await rateLimit(testId, options);
    expect(res4.success).toBe(false);
    expect(res4.remaining).toBe(0);
  });
});
