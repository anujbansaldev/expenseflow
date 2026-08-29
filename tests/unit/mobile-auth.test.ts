import { describe, it, expect, vi } from "vitest";
import { createAccessToken, verifySessionToken } from "@/lib/auth/session";
import { generateSecureToken, hashToken } from "@/lib/auth/tokens";

describe("Mobile Authentication & Token Lifecycle", () => {
  it("creates and verifies mobile JWT access token correctly", async () => {
    const payload = {
      userId: "66d0c1e1cbd727c494b8a7b0",
      email: "mobile@expenseflow.app",
      name: "Mobile Trader",
    };

    const token = await createAccessToken(payload);
    expect(token).toBeDefined();
    expect(typeof token).toBe("string");

    const verified = await verifySessionToken(token);
    expect(verified).not.toBeNull();
    expect(verified?.userId).toBe(payload.userId);
    expect(verified?.email).toBe(payload.email);
    expect(verified?.name).toBe(payload.name);
  });

  it("generates cryptographic refresh tokens and deterministic SHA-256 hashes", () => {
    const token1 = generateSecureToken();
    const token2 = generateSecureToken();

    expect(token1.length).toBe(64);
    expect(token2.length).toBe(64);
    expect(token1).not.toBe(token2);

    const hash1 = hashToken(token1);
    const hash1Again = hashToken(token1);
    expect(hash1).toBe(hash1Again);
    expect(hash1.length).toBe(64);
  });
});
