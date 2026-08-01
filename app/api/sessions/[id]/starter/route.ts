import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser, isServiceToken, unauthorized, forbidden, badRequest, tooLarge, notFound } from "@/lib/api";
import { saveStarterZip, isZipFile, maxUploadBytes, readStarterZip } from "@/lib/storage";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const session = await prisma.drillSession.findUnique({ where: { id } });
  if (!session || session.userId !== user.id) return notFound();
  if (session.type !== "code") return NextResponse.json({ error: "Not a code session" }, { status: 400 });

  const buffer = await readStarterZip(id);
  if (!buffer) return notFound();

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${id}.zip"`,
      "Content-Length": String(buffer.length),
    },
  });
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getSessionUser();
  if (!user && !isServiceToken(request)) return unauthorized();
  if (user && !user.isAdmin) return forbidden();

  const session = await prisma.drillSession.findUnique({ where: { id } });
  if (!session) return notFound();
  if (session.type !== "code") return badRequest("Starter files are only for code sessions");

  const formData = await request.formData().catch(() => null);
  if (!formData) return badRequest("Expected multipart form data with a file field named 'file'");

  const file = formData.get("file");
  if (!(file instanceof File)) return badRequest("Expected multipart file field named 'file'");

  if (file.size > maxUploadBytes()) return tooLarge();
  if (!isZipFile(file.name, file.type)) return badRequest("Starter file must be a .zip archive");

  const buffer = Buffer.from(await file.arrayBuffer());
  const path = await saveStarterZip(session.id, buffer);

  const updated = await prisma.drillSession.update({
    where: { id },
    data: { starterPath: path },
  });

  return NextResponse.json({ session: updated });
}
