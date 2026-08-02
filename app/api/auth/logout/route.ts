import { NextResponse } from "next/server";
import { getDrillSession } from "@/lib/session";
import { authMarkerCookieName } from "@/lib/auth-marker";
import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = await cookies();
  const session = await getDrillSession(cookieStore);
  session.destroy();
  cookieStore.set(authMarkerCookieName(), "", { maxAge: 0, path: "/" });
  return NextResponse.json({ ok: true });
}
