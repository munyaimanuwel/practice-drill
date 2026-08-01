import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionUser, unauthorized, forbidden, badRequest, notFound } from "@/lib/api";

const gradeSchema = z.object({
  score: z.number().min(0).max(100),
  feedback: z.string().optional().default(""),
});

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getSessionUser();
  if (!user) return unauthorized();
  if (!user.isAdmin) return forbidden();

  const session = await prisma.drillSession.findUnique({ where: { id } });
  if (!session) return notFound();

  const body = await request.json().catch(() => null);
  const parsed = gradeSchema.safeParse(body);
  if (!parsed.success) return badRequest("Invalid grade payload");

  const updated = await prisma.drillSession.update({
    where: { id },
    data: {
      score: parsed.data.score,
      feedback: parsed.data.feedback,
      status: "graded",
      gradedAt: new Date(),
    },
  });

  return NextResponse.json({ session: updated });
}
