import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser, unauthorized, badRequest, tooLarge, notFound } from "@/lib/api";
import { saveSubmissionZip, isZipFile, maxUploadBytes } from "@/lib/storage";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const session = await prisma.drillSession.findUnique({ where: { id } });
  if (!session || session.userId !== user.id) return notFound();
  if (session.type !== "code") return badRequest("Submissions are only for code sessions");
  if (["graded", "cancelled"].includes(session.status)) {
    return badRequest(`Cannot submit to a ${session.status} session`);
  }

  const formData = await request.formData().catch(() => null);
  if (!formData) return badRequest("Expected multipart form data with a file field named 'file'");

  const file = formData.get("file");
  if (!(file instanceof File)) return badRequest("Expected multipart file field named 'file'");

  if (file.size > maxUploadBytes()) return tooLarge();
  if (!isZipFile(file.name, file.type)) return badRequest("Submission must be a .zip archive");

  const buffer = Buffer.from(await file.arrayBuffer());
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const path = await saveSubmissionZip(session.id, buffer, timestamp);

  const updated = await prisma.drillSession.update({
    where: { id },
    data: {
      submissionPath: path,
      status: "submitted",
      submittedAt: new Date(),
    },
  });

  return NextResponse.json({ session: updated });
}
