import { describe, it, expect } from "vitest";
import { hashPassword, comparePassword } from "@/lib/auth/password";
import { generateSecureToken, hashToken } from "@/lib/auth/tokens";
import { createSessionToken, verifySessionToken } from "@/lib/auth/session";
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from "@/schemas/auth.schema";

describe("Password Hashing & Verification", () => {
  it("hashes password and verifies candidate correctly", async () => {
    const raw = "SuperSecretPassword123!";
    const hash = await hashPassword(raw);

    expect(hash).not.toBe(raw);
    expect(hash.startsWith("$2")).toBe(true);

    const isMatch = await comparePassword(raw, hash);
    expect(isMatch).toBe(true);

    const wrongMatch = await comparePassword("WrongPassword123!", hash);
    expect(wrongMatch).toBe(false);
  });
});

describe("Cryptographic Tokens", () => {
  it("generates 64-character random hex token", () => {
    const token1 = generateSecureToken();
    const token2 = generateSecureToken();
    expect(token1).toHaveLength(64);
    expect(token2).toHaveLength(64);
    expect(token1).not.toBe(token2);
  });

  it("computes deterministic SHA-256 hash", () => {
    const raw = "sample-reset-token-12345";
    const h1 = hashToken(raw);
    const h2 = hashToken(raw);
    expect(h1).toBe(h2);
    expect(h1).toHaveLength(64);
  });
});

describe("JWT Session Tokens", () => {
  it("creates and verifies valid JWT session token", async () => {
    const payload = {
      userId: "64b0f89e2c1e4b001a123456",
      email: "test@example.com",
      name: "Test User",
    };

    const token = await createSessionToken(payload);
    expect(typeof token).toBe("string");

    const decoded = await verifySessionToken(token);
    expect(decoded).not.toBeNull();
    expect(decoded?.userId).toBe(payload.userId);
    expect(decoded?.email).toBe(payload.email);
    expect(decoded?.name).toBe(payload.name);
  });

  it("returns null for malformed or tampered token", async () => {
    const validToken = await createSessionToken({
      userId: "123",
      email: "test@example.com",
      name: "Test",
    });

    const tampered = validToken.slice(0, -5) + "abcde";
    const decoded = await verifySessionToken(tampered);
    expect(decoded).toBeNull();
  });
});

describe("Auth Validation Schemas", () => {
  it("validates valid registration input", () => {
    const res = registerSchema.safeParse({
      name: "John Doe",
      email: "john@example.com",
      password: "password123",
    });
    expect(res.success).toBe(true);
  });

  it("rejects short password or invalid email in register", () => {
    const res = registerSchema.safeParse({
      name: "J",
      email: "not-an-email",
      password: "123",
    });
    expect(res.success).toBe(false);
  });

  it("validates login schema", () => {
    const valid = loginSchema.safeParse({
      email: "user@example.com",
      password: "some-password",
    });
    expect(valid.success).toBe(true);

    const invalid = loginSchema.safeParse({
      email: "invalid-email",
      password: "",
    });
    expect(invalid.success).toBe(false);
  });
});
