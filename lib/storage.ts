import { mkdir, writeFile, readFile } from "node:fs/promises";
import path from "node:path";

export function storageRoot(): string {
  return path.resolve(process.cwd(), process.env.STORAGE_ROOT ?? "./storage");
}

export function starterDir(): string {
  return path.join(storageRoot(), "starters");
}

export function submissionsDir(): string {
  return path.join(storageRoot(), "submissions");
}

export function ensureStorageDirs() {
  return Promise.all([
    mkdir(starterDir(), { recursive: true }),
    mkdir(submissionsDir(), { recursive: true }),
  ]);
}

export function starterPathFor(sessionId: string): string {
  return path.join(starterDir(), `${sessionId}.zip`);
}

export function submissionPathFor(sessionId: string, timestamp: string): string {
  return path.join(submissionsDir(), `${sessionId}_${timestamp}_submission.zip`);
}

export async function saveStarterZip(sessionId: string, buffer: Buffer): Promise<string> {
  await ensureStorageDirs();
  const p = starterPathFor(sessionId);
  await writeFile(p, buffer);
  return p;
}

export async function saveSubmissionZip(
  sessionId: string,
  buffer: Buffer,
  timestamp: string
): Promise<string> {
  await ensureStorageDirs();
  const p = submissionPathFor(sessionId, timestamp);
  await writeFile(p, buffer);
  return p;
}

export async function readStarterZip(sessionId: string): Promise<Buffer | null> {
  const p = starterPathFor(sessionId);
  try {
    return await readFile(p);
  } catch {
    return null;
  }
}

export function maxUploadBytes(): number {
  const n = Number(process.env.MAX_UPLOAD_BYTES);
  return Number.isFinite(n) && n > 0 ? n : 20 * 1024 * 1024;
}

export function isZipFile(filename: string, mimeType: string | null): boolean {
  const ext = path.extname(filename).toLowerCase();
  const nameOk = ext === ".zip";
  const mimeOk = mimeType === "application/zip" || mimeType === "application/x-zip-compressed";
  return nameOk || mimeOk;
}
