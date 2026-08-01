import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { SessionStatus } from "@prisma/client";
import { getSessionUser, isServiceToken, unauthorized, forbidden, badRequest } from "@/lib/api";

const listQuerySchema = z.object({
  status: z
    .string()
    .optional()
    .refine((s) => {
      if (!s) return true;
      return s
        .split(",")
        .every((x) =>
          ["draft", "ready", "in_progress", "submitted", "grade_requested", "graded", "cancelled"].includes(
            x
          )
        );
    }, "Invalid status filter"),
});

const createSessionSchema = z.object({
  type: z.enum(["quiz", "code"]),
  title: z.string().min(1).max(200),
  summary: z.string().max(500).optional().nullable(),
  topicTags: z.array(z.string()).default([]),
  difficulty: z.number().int().min(1).max(5).default(3),
  timeLimitMinutes: z.number().int().min(1).max(600).default(45),
  scheduledFor: z.string().datetime().optional().nullable(),
  status: z
    .enum(["draft", "ready", "in_progress", "submitted", "grade_requested", "graded", "cancelled"])
    .default("draft"),
  payload: z.record(z.unknown()).default({}),
});

export async function GET(request: NextRequest) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const { searchParams } = new URL(request.url);
  const query = listQuerySchema.safeParse({ status: searchParams.get("status") ?? undefined });
  if (!query.success) {
    return NextResponse.json({ error: "Invalid status filter" }, { status: 400 });
  }

  const statuses = query.data.status?.split(",") as SessionStatus[] | undefined;

  const sessions = await prisma.drillSession.findMany({
    where: { userId: user.id, ...(statuses ? { status: { in: statuses } } : {}) },
    orderBy: [{ scheduledFor: "desc" }, { createdAt: "desc" }],
    take: 50,
    select: {
      id: true,
      type: true,
      status: true,
      title: true,
      summary: true,
      difficulty: true,
      timeLimitMinutes: true,
      scheduledFor: true,
      createdAt: true,
      submittedAt: true,
      score: true,
    },
  });

  return NextResponse.json({ sessions });
}

export async function POST(request: NextRequest) {
  const user = await getSessionUser();
  if (!user && !isServiceToken(request)) return unauthorized();
  if (user && !user.isAdmin) return forbidden();

  const body = await request.json().catch(() => null);
  const parsed = createSessionSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest("Invalid session payload: " + parsed.error.issues.map((i) => i.message).join("; "));
  }

  const session = await prisma.drillSession.create({
    data: {
      type: parsed.data.type,
      title: parsed.data.title,
      summary: parsed.data.summary ?? null,
      topicTags: parsed.data.topicTags,
      difficulty: parsed.data.difficulty,
      timeLimitMinutes: parsed.data.timeLimitMinutes,
      scheduledFor: parsed.data.scheduledFor ? new Date(parsed.data.scheduledFor) : null,
      status: parsed.data.status,
      payload: parsed.data.payload as object,
      userId: user?.id ?? (await prisma.user.findFirst())!.id,
    },
  });

  return NextResponse.json({ session }, { status: 201 });
}
