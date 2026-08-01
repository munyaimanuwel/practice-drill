"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import type { SessionDto } from "@/lib/types";
import Markdown from "@/components/markdown";

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
      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={startSession}
          disabled={status !== "ready" || busy !== null}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {status === "ready" ? "Start" : "Started"}
        </button>
        <span className="text-sm text-slate-500">
          Status: <span className="font-medium text-slate-700">{status.replace("_", " ")}</span>
        </span>
      </div>

      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Brief</h2>
          {session.payload.brief_markdown ? (
            <Markdown source={session.payload.brief_markdown} />
          ) : (
            <p className="text-sm text-slate-500">No brief provided.</p>
          )}
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Rubric</h2>
          {session.payload.rubric_markdown ? (
            <Markdown source={session.payload.rubric_markdown} />
          ) : (
            <p className="text-sm text-slate-500">No rubric provided.</p>
          )}
        </section>
      </div>

      {session.payload.hints && session.payload.hints.length > 0 && (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-5">
          <h2 className="mb-2 text-sm font-semibold text-amber-800">Hints</h2>
          <ul className="list-disc space-y-1 pl-5 text-sm text-amber-900">
            {session.payload.hints.map((h, i) => (
              <li key={i}>{h}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Work in your IDE
        </h2>
        <ol className="list-decimal space-y-1 pl-5 text-sm text-slate-700">
          <li>Download the starter pack below.</li>
          <li>Unzip it and open the folder in Cursor or VS Code (or the .sln in Visual Studio).</li>
          <li>Solve the challenge locally.</li>
          <li>Zip the <strong>whole solution folder</strong> back up and upload it here.</li>
        </ol>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          {session.hasStarter && (
            <a
              href={`/api/sessions/${session.id}/starter`}
              className="rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-900"
            >
              Download starter (.zip)
            </a>
          )}

          {canUpload && (
            <>
              <label className="cursor-pointer rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
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
                <span className="text-sm text-slate-500">
                  {progress !== null ? `${progress}%` : "Uploading..."}
                </span>
              )}
            </>
          )}

          {(status === "submitted" || status === "grade_requested") && (
            <button
              onClick={requestGrade}
              disabled={busy !== null}
              className="rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {busy === "grade" ? "Requesting..." : "Request grade"}
            </button>
          )}
        </div>

        {hasSubmission && (
          <p className="mt-3 text-sm text-slate-500">
            Submission uploaded. You can replace it until it&apos;s graded.
          </p>
        )}
      </div>

      {status === "grade_requested" && (
        <div className="mt-4 rounded-md bg-purple-50 px-4 py-3 text-sm text-purple-800">
          Grade requested — waiting for a human or agent review.
        </div>
      )}

      {status === "graded" && (
        <div className="mt-6 rounded-lg border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-semibold text-slate-900">{session.score ?? "—"}/100</span>
            <span className="text-sm text-slate-500">Graded</span>
          </div>
          {session.feedback && (
            <div className="mt-3 whitespace-pre-wrap text-sm text-slate-700">{session.feedback}</div>
          )}
        </div>
      )}

      {error && (
        <div role="alert" className="mt-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
    </div>
  );
}
