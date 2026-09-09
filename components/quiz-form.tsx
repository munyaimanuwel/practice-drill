"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { SessionDto, QuizQuestion } from "@/lib/types";
import { StatusBadge } from "@/components/badges";
import { CheckIcon, GradeIcon, SaveIcon, StartIcon } from "@/components/icons";

interface Props {
  session: SessionDto;
  questions: QuizQuestion[];
  initialAnswers: Record<string, string>;
}

export default function QuizForm({ session, questions, initialAnswers }: Props) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, string>>(initialAnswers);
  const [status, setStatus] = useState(session.status);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canAnswer = ["ready", "in_progress", "submitted", "grade_requested"].includes(status);
  const isFinalized = ["submitted", "grade_requested", "graded"].includes(status);
  const showGrade = status === "graded";

  function setAnswer(id: string, value: string) {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  }

  async function saveDraft() {
    setBusy("draft");
    setError(null);
    try {
      const res = await fetch(`/api/sessions/${session.id}/answers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers, finalize: false }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to save draft");
      }
      if (status === "ready") setStatus("in_progress");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save draft");
    } finally {
      setBusy(null);
    }
  }

  async function submitAnswers() {
    const missing = questions.filter((q) => !answers[q.id]?.trim());
    if (missing.length > 0) {
      setError(`Please answer all questions before submitting (missing: ${missing.map((q) => q.id).join(", ")}).`);
      return;
    }
    setBusy("submit");
    setError(null);
    try {
      const res = await fetch(`/api/sessions/${session.id}/answers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers, finalize: true }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to submit");
      }
      setStatus("submitted");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to submit");
    } finally {
      setBusy(null);
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

      {canAnswer && (
        <>
          <ol className="space-y-4">
            {questions.map((q, idx) => (
              <li key={q.id} className="border border-border bg-card">
                <div className="flex items-start gap-4 p-5">
                  <span className="font-mono text-sm text-muted-foreground" aria-hidden>
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex items-start justify-between gap-3">
                      <p className="font-medium text-foreground">{q.prompt}</p>
                      {q.points && (
                        <span className="shrink-0 font-mono text-xs text-muted-foreground">{q.points} pts</span>
                      )}
                    </div>
                    <textarea
                      aria-label={`Answer for question ${idx + 1}`}
                      value={answers[q.id] ?? ""}
                      onChange={(e) => setAnswer(q.id, e.target.value)}
                      rows={5}
                      className="field"
                      placeholder="Type your answer…"
                    />
                  </div>
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button onClick={saveDraft} disabled={busy !== null} className="btn btn-quiet">
              <SaveIcon className="h-4 w-4" />
              {busy === "draft" ? "Saving…" : "Save draft"}
            </button>
            <button
              onClick={submitAnswers}
              disabled={busy !== null || isFinalized}
              className="btn btn-primary"
            >
              <CheckIcon className="h-4 w-4" />
              {busy === "submit" ? "Submitting…" : "Submit answers"}
            </button>
            {status === "submitted" && (
              <button onClick={requestGrade} disabled={busy !== null} className="btn btn-secondary">
                <GradeIcon className="h-4 w-4" />
                {busy === "grade" ? "Requesting…" : "Request grade"}
              </button>
            )}
          </div>
        </>
      )}

      {status === "submitted" && !showGrade && (
        <div className="mt-4 bg-info-soft px-4 py-3 text-sm text-info-soft-foreground">
          Answers submitted. You can still edit them below; click <strong>Request grade</strong> when done.
        </div>
      )}

      {status === "grade_requested" && (
        <div className="mt-4 bg-secondary-soft px-4 py-3 text-sm text-secondary-soft-foreground">
          Grade requested — waiting for a human or agent review.
        </div>
      )}

      {showGrade && (
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
