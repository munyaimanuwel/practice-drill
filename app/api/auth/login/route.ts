import { NextResponse } from "next/server";
import { getDrillSession } from "@/lib/session";
import { createAuthMarker, authMarkerCookieName } from "@/lib/auth-marker";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email.toLowerCase() },
  });
  if (!user) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  const cookieStore = await cookies();
  const session = await getDrillSession(cookieStore);
  session.user = {
    id: user.id,
    email: user.email,
    name: user.name,
    isAdmin: user.isAdmin,
  };
  await session.save();

  // Set the Edge-safe auth marker cookie (verified by middleware).
  cookieStore.set(authMarkerCookieName(), await createAuthMarker(user.id), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });

  return NextResponse.json({
    user: { id: user.id, email: user.email, name: user.name },
  });
}
