import { describe, it, expect } from "vitest";
import { rateLimit, enforceRateLimit } from "@/lib/rate-limit/rate-limit";
import { RateLimitError } from "@/lib/errors/errors";

describe("Rate Limiter", () => {
  it("allows requests under the threshold", () => {
    const key = "test-ip-1";
    const res1 = rateLimit(key, 3, 1000);
    expect(res1.success).toBe(true);
    expect(res1.remaining).toBe(2);

    const res2 = rateLimit(key, 3, 1000);
    expect(res2.success).toBe(true);
    expect(res2.remaining).toBe(1);

    const res3 = rateLimit(key, 3, 1000);
    expect(res3.success).toBe(true);
    expect(res3.remaining).toBe(0);

    const res4 = rateLimit(key, 3, 1000);
    expect(res4.success).toBe(false);
    expect(res4.remaining).toBe(0);
  });

  it("throws RateLimitError when enforcing limit", () => {
    const key = "test-ip-2";
    enforceRateLimit(key, 1, 1000); // 1st allowed

    expect(() => enforceRateLimit(key, 1, 1000)).toThrow(RateLimitError);
  });
});
