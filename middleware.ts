import { NextResponse, type NextRequest } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions, type SessionData } from "@/lib/session";

const PUBLIC_API_PREFIXES = ["/api/auth/login", "/api/auth/logout"];

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
