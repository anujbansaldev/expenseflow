import bcrypt from "bcryptjs";

const SALT_ROUNDS = 12;

/**
 * Hashes a plaintext password using bcrypt with adaptive salt rounds.
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compares a candidate password against a stored bcrypt hash.
 */
export async function comparePassword(
  candidate: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(candidate, hash);
}
