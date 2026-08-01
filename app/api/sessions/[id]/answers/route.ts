import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionUser, unauthorized, badRequest, notFound } from "@/lib/api";

const answersSchema = z.object({
  answers: z.record(z.string().max(20000)),
  finalize: z.boolean().optional().default(false),
});

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const session = await prisma.drillSession.findUnique({ where: { id } });
  if (!session || session.userId !== user.id) return notFound();
  if (session.type !== "quiz") return badRequest("Answers are only valid for quiz sessions");
  if (["graded", "cancelled"].includes(session.status)) {
    return badRequest(`Cannot answer a ${session.status} session`);
  }

  const body = await request.json().catch(() => null);
  const parsed = answersSchema.safeParse(body);
  if (!parsed.success) return badRequest("Invalid answers payload");

  const data: Record<string, unknown> = {
    answerPayload: parsed.data.answers,
  };

  // First edit (or finalize) on a ready session moves it to in_progress.
  if (session.status === "ready") {
    data.status = "in_progress";
    data.openedAt = new Date();
  }

  if (parsed.data.finalize && session.status !== "submitted" && session.status !== "grade_requested") {
    data.status = "submitted";
    data.submittedAt = new Date();
  }

  const updated = await prisma.drillSession.update({ where: { id }, data });
  return NextResponse.json({ session: updated });
}
