import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser, unauthorized, badRequest, notFound } from "@/lib/api";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const session = await prisma.drillSession.findUnique({ where: { id } });
  if (!session || session.userId !== user.id) return notFound();

  if (session.status === "graded" || session.status === "cancelled") {
    return badRequest(`Cannot request grade for a ${session.status} session`);
  }
  if (session.status !== "submitted" && session.status !== "grade_requested") {
    return badRequest("Session must be submitted before requesting a grade");
  }

  const updated = await prisma.drillSession.update({
    where: { id },
    data: { status: "grade_requested" },
  });

  return NextResponse.json({ session: updated });
}
