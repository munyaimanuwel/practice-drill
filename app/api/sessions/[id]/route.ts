import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionUser, unauthorized, forbidden, badRequest, notFound } from "@/lib/api";
import { readStarterZip } from "@/lib/storage";

const patchSchema = z.object({
  status: z.enum(["ready", "in_progress", "submitted", "grade_requested", "graded", "cancelled"]),
  score: z.number().min(0).max(100).optional(),
  feedback: z.string().optional(),
  gradeRubricNotes: z.string().optional(),
});

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const session = await prisma.drillSession.findUnique({ where: { id } });
  if (!session || session.userId !== user.id) return notFound();

  const hasStarter = (await readStarterZip(session.id)) !== null;

  return NextResponse.json({
    session: {
      id: session.id,
      type: session.type,
      status: session.status,
      title: session.title,
      summary: session.summary,
      topicTags: session.topicTags,
      difficulty: session.difficulty,
      timeLimitMinutes: session.timeLimitMinutes,
      scheduledFor: session.scheduledFor,
      createdAt: session.createdAt,
      openedAt: session.openedAt,
      submittedAt: session.submittedAt,
      gradedAt: session.gradedAt,
      score: session.score,
      feedback: session.feedback,
      payload: session.payload,
      answerPayload: session.answerPayload,
      starterPath: session.starterPath,
      submissionPath: session.submissionPath,
      hasStarter,
      hasSubmission: !!session.submissionPath,
    },
  });
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const session = await prisma.drillSession.findUnique({ where: { id } });
  if (!session || session.userId !== user.id) return notFound();

  const body = await request.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return badRequest("Invalid body: " + parsed.error.issues.map((i) => i.message).join("; "));

  const { status, score, feedback, gradeRubricNotes } = parsed.data;

  // Status transition validation (per PRODUCT.md lifecycle).
  // Note: transitions to `graded` are only allowed via POST /api/sessions/:id/grade (admin).
  if (status && status !== session.status) {
    const allowed: Record<string, string[]> = {
      ready: ["in_progress", "cancelled"],
      in_progress: ["submitted", "cancelled"],
      submitted: ["grade_requested"],
      grade_requested: [],
      graded: [],
      cancelled: [],
    };
    const next = allowed[session.status] ?? [];
    if (!next.includes(status)) {
      return badRequest(`Cannot transition from ${session.status} to ${status}`);
    }
  }

  // Admin-only fields: score / feedback / gradeRubricNotes, and any graded status.
  const setsGradeField = score !== undefined || feedback !== undefined || gradeRubricNotes !== undefined;
  const setsGraded = status === "graded";
  if ((setsGradeField || setsGraded) && !user.isAdmin) {
    return forbidden();
  }

  const data: Record<string, unknown> = {};
  if (status) data.status = status;
  if (score !== undefined) data.score = score;
  if (feedback !== undefined) data.feedback = feedback;
  if (gradeRubricNotes !== undefined) data.gradeRubricNotes = gradeRubricNotes;

  const updated = await prisma.drillSession.update({
    where: { id },
    data,
  });

  return NextResponse.json({ session: updated });
}
