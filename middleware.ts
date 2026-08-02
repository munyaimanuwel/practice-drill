import { NextResponse, type NextRequest } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions, type SessionData } from "@/lib/session";

const PUBLIC_API_PREFIXES = ["/api/auth/login", "/api/auth/logout"];

// Constant-time-ish compare to avoid leaking the token via timing.
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

// Does this request carry a valid service token for the create/starter routes?
function isServiceCreateRequest(request: NextRequest): boolean {
  const token = process.env.SESSION_CREATE_TOKEN;
  if (!token || token === "change-me-session-create-token") return false;

  const { pathname } = request.nextUrl;
  const method = request.method;

  const isCreateSession = method === "POST" && pathname === "/api/sessions";
  const isStarterUpload =
    method === "POST" && /^\/api\/sessions\/[^/]+\/starter$/.test(pathname);

  if (!isCreateSession && !isStarterUpload) return false;

  const header = request.headers.get("authorization") ?? "";
  const match = /^Bearer\s+(.+)$/.exec(header);
  return !!match && safeEqual(match[1], token);
}

// Middleware only needs to READ the session; iron-session requires a cookie
// store, so adapt the request's Cookie header into one.
function cookieStoreFromRequest(request: NextRequest) {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const map = new Map<string, string>();
  for (const part of cookieHeader.split(";")) {
    const idx = part.indexOf("=");
    if (idx === -1) continue;
    const name = part.slice(0, idx).trim();
    const value = part.slice(idx + 1).trim();
    if (name) map.set(name, decodeURIComponent(value));
  }
  return {
    get: (name: string) => {
      const value = map.get(name);
      return value ? { name, value } : undefined;
    },
    set: () => {},
  };
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/_next") || pathname === "/favicon.ico") return NextResponse.next();

  const isApi = pathname.startsWith("/api/");
  const isPublicApi = PUBLIC_API_PREFIXES.some((p) => pathname.startsWith(p));

  // Public API (login/logout) — no auth needed.
  if (isApi && isPublicApi) return NextResponse.next();

  // Service-token routes (POST /api/sessions, POST /api/sessions/:id/starter).
  if (isApi && isServiceCreateRequest(request)) return NextResponse.next();

  const session = await getIronSession<SessionData>(cookieStoreFromRequest(request), {
    ...sessionOptions,
  });

  // Protect all other /api/* routes.
  if (isApi) {
    if (!session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.next();
  }

  // Protect pages: /login is public, everything else requires auth.
  if (pathname === "/login") return NextResponse.next();

  if (!session.user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*", "/((?!_next/static|_next/image|favicon.ico).*)"],
};
