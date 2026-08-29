import { SignJWT, jwtVerify } from "jose";
import { cookies, headers } from "next/headers";
import { UnauthorizedError } from "@/lib/errors/errors";

export const SESSION_COOKIE_NAME = "expenseflow_session";
const SESSION_EXPIRATION = "7d"; // 7 days for web cookies
const ACCESS_TOKEN_EXPIRATION = "15m"; // 15 minutes for mobile access tokens
const MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

export interface SessionPayload {
  userId: string;
  email: string;
  name: string;
}

function getSecretKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET || "default_expenseflow_foundation_secret_key_32_chars";
  return new TextEncoder().encode(secret);
}

/**
 * Creates a signed JWT web session token (7 days).
 */
export async function createSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(SESSION_EXPIRATION)
    .sign(getSecretKey());
}

/**
 * Creates a short-lived signed JWT access token for mobile clients (15 minutes).
 */
export async function createAccessToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(ACCESS_TOKEN_EXPIRATION)
    .sign(getSecretKey());
}

/**
 * Verifies a JWT token (session or mobile access token) and extracts the payload.
 * Returns null if token is invalid or expired.
 */
export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return {
      userId: payload.userId as string,
      email: payload.email as string,
      name: payload.name as string,
    };
  } catch {
    return null;
  }
}

/**
 * Sets the session cookie on the outgoing response (web).
 */
export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

/**
 * Clears the session cookie (web).
 */
export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

/**
 * Extracts and verifies the current session from:
 * 1. Authorization: Bearer <accessToken> header (for mobile / API clients)
 * 2. Cookie: expenseflow_session (for web app browser sessions)
 */
export async function getSessionUser(): Promise<SessionPayload | null> {
  try {
    // 1. Check Bearer token in Authorization header
    const headersList = await headers();
    const authHeader = headersList.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const bearerToken = authHeader.substring(7).trim();
      if (bearerToken) {
        const verified = await verifySessionToken(bearerToken);
        if (verified) return verified;
      }
    }

    // 2. Check HttpOnly session cookie
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
    if (!sessionCookie?.value) {
      return null;
    }
    return await verifySessionToken(sessionCookie.value);
  } catch {
    return null;
  }
}

/**
 * Server helper to require an authenticated session or throw an UnauthorizedError.
 */
export async function requireAuthUser(): Promise<SessionPayload> {
  const session = await getSessionUser();
  if (!session) {
    throw new UnauthorizedError("Authentication required to access this resource.");
  }
  return session;
}
