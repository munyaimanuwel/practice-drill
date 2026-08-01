"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { SessionDto, QuizQuestion } from "@/lib/types";

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

      {canAnswer && (
        <>
          <div className="space-y-6">
            {questions.map((q, idx) => (
              <div key={q.id} className="rounded-lg border border-slate-200 bg-white p-5">
                <div className="mb-2 flex items-start justify-between gap-3">
                  <p className="font-medium text-slate-900">
                    {idx + 1}. {q.prompt}
                  </p>
                  {q.points && (
                    <span className="shrink-0 text-xs font-medium text-slate-400">{q.points} pts</span>
                  )}
                </div>
                <textarea
                  aria-label={`Answer for question ${idx + 1}`}
                  value={answers[q.id] ?? ""}
                  onChange={(e) => setAnswer(q.id, e.target.value)}
                  rows={5}
                  className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Type your answer..."
                />
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center gap-3">
            <button
              onClick={saveDraft}
              disabled={busy !== null}
              className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {busy === "draft" ? "Saving..." : "Save draft"}
            </button>
            <button
              onClick={submitAnswers}
              disabled={busy !== null || isFinalized}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {busy === "submit" ? "Submitting..." : "Submit answers"}
            </button>
            {status === "submitted" && (
              <button
                onClick={requestGrade}
                disabled={busy !== null}
                className="rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {busy === "grade" ? "Requesting..." : "Request grade"}
              </button>
            )}
          </div>
        </>
      )}

      {status === "submitted" && !showGrade && (
        <div className="mt-4 rounded-md bg-blue-50 px-4 py-3 text-sm text-blue-800">
          Answers submitted. You can still edit them below; click <strong>Request grade</strong> when done.
        </div>
      )}

      {status === "grade_requested" && (
        <div className="mt-4 rounded-md bg-purple-50 px-4 py-3 text-sm text-purple-800">
          Grade requested — waiting for a human or agent review.
        </div>
      )}

      {showGrade && (
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
