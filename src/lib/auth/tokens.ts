import crypto from "crypto";

/**
 * Generates a cryptographically secure random token (64 hex characters / 32 bytes).
 */
export function generateSecureToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Generates a deterministic SHA-256 hash of a raw token for storage at rest.
 */
export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}
