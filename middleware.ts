import { NextResponse, type NextRequest } from "next/server";
import { verifyAuthMarker, authMarkerCookieName } from "@/lib/auth-marker";

const PUBLIC_API_PREFIXES = ["/api/auth/login", "/api/auth/logout"];

// Constant-time compare to avoid leaking the token via timing.
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

function getCookie(request: NextRequest, name: string): string | undefined {
  const cookieHeader = request.headers.get("cookie") ?? "";
  for (const part of cookieHeader.split(";")) {
    const idx = part.indexOf("=");
    if (idx === -1) continue;
    if (part.slice(0, idx).trim() === name) {
      const value = part.slice(idx + 1).trim();
      try {
        return decodeURIComponent(value);
      } catch {
        return value;
      }
    }
  }
  return undefined;
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

  const marker = getCookie(request, authMarkerCookieName());
  const hasValidSession = marker ? await verifyAuthMarker(marker) : false;

  // Protect all other /api/* routes.
  if (isApi) {
    if (!hasValidSession) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.next();
  }

  // Protect pages: /login is public, everything else requires auth.
  if (pathname === "/login") return NextResponse.next();

  if (!hasValidSession) {
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
