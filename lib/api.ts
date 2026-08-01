import { NextRequest, NextResponse } from "next/server";
import { getDrillSession } from "@/lib/session";
import { cookies } from "next/headers";

export async function getSessionUser() {
  const cookieStore = await cookies();
  const session = await getDrillSession(cookieStore);
  return session.user ?? null;
}

export function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export function forbidden() {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

export function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

export function notFound() {
  return NextResponse.json({ error: "Not found" }, { status: 404 });
}

export function tooLarge() {
  return NextResponse.json({ error: "File too large" }, { status: 413 });
}

export function parseJson(req: Request): Promise<unknown> {
  return req.json().catch(() => null);
}

export function isServiceToken(request: NextRequest): boolean {
  const header = request.headers.get("authorization") ?? "";
  const token = process.env.SESSION_CREATE_TOKEN;
  if (!token || token === "change-me-session-create-token") return false;
  return header === `Bearer ${token}`;
}
