import { getIronSession as ironGetSession } from "iron-session";

interface SessionCookieStore {
  get: (name: string) => { name: string; value: string } | undefined;
  set: {
    (name: string, value: string, cookie?: { domain?: string; path?: string; expires?: Date | number; httpOnly?: boolean; maxAge?: number; sameSite?: "lax" | "strict" | "none"; secure?: boolean; priority?: "low" | "medium" | "high" }): void;
    (options: { name: string; value: string; domain?: string; path?: string; expires?: Date | number; httpOnly?: boolean; maxAge?: number; sameSite?: "lax" | "strict" | "none"; secure?: boolean; priority?: "low" | "medium" | "high" }): void;
  };
}

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  isAdmin: boolean;
}

export interface SessionData {
  user?: SessionUser;
}

const FALLBACK_SECRET =
  "dev-only-secret-please-set-AUTH_SECRET-in-env-00000000000000000000000000000000";

export const sessionOptions = {
  password:
    process.env.AUTH_SECRET && process.env.AUTH_SECRET !== "change-me-to-a-long-random-string"
      ? process.env.AUTH_SECRET
      : FALLBACK_SECRET,
  cookieName: "drill_session",
  cookieOptions: {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: "/",
  },
};

export async function getDrillSession(cookieStore: SessionCookieStore) {
  return ironGetSession<SessionData>(cookieStore, sessionOptions);
}
