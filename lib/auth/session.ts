import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export type RoleType = "ADMIN" | "MEMBER" | "GUEST";

export interface SessionPayload {
  userId: string;
  email: string;
  name: string;
  role: RoleType;
  avatarUrl?: string;
  [key: string]: unknown;
}

const SESSION_SECRET =
  process.env.SESSION_SECRET ||
  "fst-assignment-2-super-secure-session-secret-key-32-chars-long!";

const key = new TextEncoder().encode(SESSION_SECRET);

export const SESSION_COOKIE_NAME = "session_token";

/**
 * Sign a new JWT session token (Edge & Node compatible)
 */
export async function signSessionToken(payload: SessionPayload): Promise<string> {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(key);
}

/**
 * Verify a JWT session token (Edge & Node compatible)
 */
export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, key, {
      algorithms: ["HS256"],
    });
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

/**
 * Server-side helper to read and verify the current session from cookies
 */
export async function getCurrentSession(): Promise<SessionPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;
    return await verifySessionToken(token);
  } catch {
    return null;
  }
}

/**
 * Sets session cookie on Server Actions / Route Handlers
 */
export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

/**
 * Clears the session cookie
 */
export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}
