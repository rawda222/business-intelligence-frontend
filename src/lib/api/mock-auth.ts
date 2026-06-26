import "server-only";
import type { AuthResponse, LoginRequest, RegisterRequest, User } from "@/types";

/**
 * Mock auth. Demo-mode: any email + password (>=6 chars) signs in.
 * Tokens are opaque strings encoding the email so /auth/me can resolve a user.
 */
interface StoredUser {
  user: User;
  password: string;
}

const users = new Map<string, StoredUser>();

function b64(s: string): string {
  return Buffer.from(s, "utf-8").toString("base64url");
}
function unb64(s: string): string {
  return Buffer.from(s, "base64url").toString("utf-8");
}

function makeToken(kind: "access" | "refresh", email: string): string {
  return `${kind}.${b64(email)}.${Date.now()}`;
}

function emailFromToken(token: string): string | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  if (parts[0] !== "access" && parts[0] !== "refresh") return null;
  try {
    return unb64(parts[1]);
  } catch {
    return null;
  }
}

function ensureUser(email: string, fullName?: string): StoredUser {
  const existing = users.get(email.toLowerCase());
  if (existing) return existing;
  const user: User = {
    user_id: `usr_${b64(email).slice(0, 14)}`,
    email,
    full_name: fullName ?? email.split("@")[0].replace(/[._-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    role: "owner",
    created_at: new Date().toISOString(),
  };
  const stored: StoredUser = { user, password: "" };
  users.set(email.toLowerCase(), stored);
  return stored;
}

function toAuthResponse(user: User): AuthResponse {
  return {
    access_token: makeToken("access", user.email),
    refresh_token: makeToken("refresh", user.email),
    token_type: "bearer",
    expires_in: 3600,
    user,
  };
}

export function register(body: RegisterRequest): AuthResponse {
  const stored = ensureUser(body.email, body.full_name);
  stored.password = body.password;
  return toAuthResponse(stored.user);
}

export function login(body: LoginRequest): AuthResponse {
  // Demo mode: any email + password (>=6 chars) signs in.
  const stored = ensureUser(body.email);
  stored.password = body.password;
  return toAuthResponse(stored.user);
}

export function refresh(refreshToken: string): AuthResponse | null {
  const email = emailFromToken(refreshToken);
  if (!email) return null;
  const stored = ensureUser(email);
  return toAuthResponse(stored.user);
}

export function me(authHeader: string | null): User | null {
  if (!authHeader) return null;
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();
  const email = emailFromToken(token);
  if (!email) return null;
  return ensureUser(email).user;
}
