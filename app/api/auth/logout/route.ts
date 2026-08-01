import { NextResponse } from "next/server";
import { getDrillSession } from "@/lib/session";
import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = await cookies();
  const session = await getDrillSession(cookieStore);
  session.destroy();
  return NextResponse.json({ ok: true });
}
