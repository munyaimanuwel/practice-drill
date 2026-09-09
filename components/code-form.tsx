"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import type { SessionDto } from "@/lib/types";
import Markdown from "@/components/markdown";
import { StatusBadge } from "@/components/badges";
import { DownloadIcon, GradeIcon, StartIcon, UploadIcon } from "@/components/icons";

interface Props {
  session: SessionDto;
}

export default function CodeForm({ session }: Props) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState(session.status);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [hasSubmission, setHasSubmission] = useState(session.hasSubmission);

  const canUpload = ["ready", "in_progress", "submitted", "grade_requested"].includes(status);

  async function startSession() {
    setBusy("start");
    setError(null);
    try {
      const res = await fetch(`/api/sessions/${session.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "in_progress" }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to start");
      }
      setStatus("in_progress");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to start");
    } finally {
      setBusy(null);
    }
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".zip")) {
      setError("Submission must be a .zip archive.");
      e.target.value = "";
      return;
    }

    setBusy("upload");
    setError(null);
    setProgress(0);
    try {
      const form = new FormData();
      form.append("file", file);

      // Upload via XMLHttpRequest for progress events.
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", `/api/sessions/${session.id}/submission`);
        xhr.upload.onprogress = (ev) => {
          if (ev.lengthComputable) setProgress(Math.round((ev.loaded / ev.total) * 100));
        };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve();
          else {
            try {
              reject(new Error(JSON.parse(xhr.responseText).error ?? "Upload failed"));
            } catch {
              reject(new Error("Upload failed"));
            }
          }
        };
        xhr.onerror = () => reject(new Error("Upload failed — network error"));
        xhr.send(form);
      });

      setStatus("submitted");
      setHasSubmission(true);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(null);
      setProgress(null);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function requestGrade() {
    setBusy("grade");
    setError(null);
    try {
      const res = await fetch(`/api/sessions/${session.id}/request-grade`, { method: "POST" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to request grade");
      }
      setStatus("grade_requested");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to request grade");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        {status === "ready" ? (
          <button onClick={startSession} disabled={busy !== null} className="btn btn-primary">
            <StartIcon className="h-4 w-4" />
            Start
          </button>
        ) : null}
        <StatusBadge status={status} />
      </div>

      <div className="mb-6 grid gap-px overflow-hidden border border-border bg-border lg:grid-cols-2">
        <section className="bg-card p-5">
          <h2 className="mb-3 font-display text-base font-semibold text-foreground">Brief</h2>
          {session.payload.brief_markdown ? (
            <Markdown source={session.payload.brief_markdown} />
          ) : (
            <p className="text-sm text-muted-foreground">No brief provided.</p>
          )}
        </section>

        <section className="bg-card p-5">
          <h2 className="mb-3 font-display text-base font-semibold text-foreground">Rubric</h2>
          {session.payload.rubric_markdown ? (
            <Markdown source={session.payload.rubric_markdown} />
          ) : (
            <p className="text-sm text-muted-foreground">No rubric provided.</p>
          )}
        </section>
      </div>

      {session.payload.hints && session.payload.hints.length > 0 && (
        <div className="mb-6 border border-warning-border bg-warning-soft p-5">
          <h2 className="mb-2 text-sm font-semibold text-warning-soft-foreground">Hints</h2>
          <ul className="list-disc space-y-1 pl-5 text-sm text-warning-strong">
            {session.payload.hints.map((h, i) => (
              <li key={i}>{h}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="border border-border bg-card p-5">
        <h2 className="mb-3 font-display text-base font-semibold text-foreground">Work in your IDE</h2>
        <ol className="list-decimal space-y-1 pl-5 text-sm text-foreground">
          <li>Download the starter pack below.</li>
          <li>Unzip it and open the folder in Cursor or VS Code (or the .sln in Visual Studio).</li>
          <li>Solve the challenge locally.</li>
          <li>Zip the <strong>whole solution folder</strong> back up and upload it here.</li>
        </ol>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          {session.hasStarter && (
            <a href={`/api/sessions/${session.id}/starter`} className="btn btn-ink">
              <DownloadIcon className="h-4 w-4" />
              Download starter (.zip)
            </a>
          )}

          {canUpload && (
            <>
              <label className="btn btn-quiet cursor-pointer">
                <UploadIcon className="h-4 w-4" />
                {hasSubmission ? "Replace submission" : "Upload submission (.zip)"}
                <input
                  ref={fileRef}
                  type="file"
                  accept=".zip,application/zip"
                  className="sr-only"
                  onChange={handleUpload}
                  disabled={busy !== null}
                />
              </label>
              {busy === "upload" && (
                <span className="font-mono text-sm text-muted-foreground">
                  {progress !== null ? `${progress}%` : "Uploading…"}
                </span>
              )}
            </>
          )}

          {(status === "submitted" || status === "grade_requested") && (
            <button onClick={requestGrade} disabled={busy !== null} className="btn btn-secondary">
              <GradeIcon className="h-4 w-4" />
              {busy === "grade" ? "Requesting…" : "Request grade"}
            </button>
          )}
        </div>

        {hasSubmission && (
          <p className="mt-3 text-sm text-muted-foreground">
            Submission uploaded. You can replace it until it&apos;s graded.
          </p>
        )}
      </div>

      {status === "grade_requested" && (
        <div className="mt-4 bg-secondary-soft px-4 py-3 text-sm text-secondary-soft-foreground">
          Grade requested — waiting for a human or agent review.
        </div>
      )}

      {status === "graded" && (
        <div className="mt-6 border border-border bg-card p-5">
          <div className="flex items-baseline gap-3">
            <span className="font-display text-3xl font-semibold text-foreground">{session.score ?? "—"}</span>
            <span className="font-mono text-sm text-muted-foreground">/100 graded</span>
          </div>
          {session.feedback && (
            <div className="mt-3 whitespace-pre-wrap text-sm text-foreground">{session.feedback}</div>
          )}
        </div>
      )}

      {error && (
        <div role="alert" className="mt-4 bg-destructive-soft px-4 py-3 text-sm text-destructive-soft-foreground">
          {error}
        </div>
      )}
    </div>
  );
}
