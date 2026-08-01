"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { fetchSession, type SessionDto } from "@/lib/types";
import { SessionTypeBadge, StatusBadge } from "@/components/badges";
import QuizForm from "@/components/quiz-form";
import CodeForm from "@/components/code-form";

export default function SessionDetailPage() {
  const params = useParams<{ id: string }>();
  const [session, setSession] = useState<SessionDto | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSession(params.id)
      .then(setSession)
      .catch(() => setError("Failed to load session."));
  }, [params.id]);

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16 text-center">
        <p className="text-slate-600">{error}</p>
        <Link href="/sessions" className="mt-4 inline-block text-sm text-blue-600 underline">
          Back to sessions
        </Link>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16 text-center text-slate-500">Loading…</div>
    );
  }

  const questions = session.payload.questions ?? [];

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-lg font-semibold text-slate-900">{session.title}</h1>
            <p className="text-sm text-slate-500">
              <Link href="/sessions" className="text-blue-600 underline">
                ← All sessions
              </Link>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <SessionTypeBadge type={session.type} />
            <StatusBadge status={session.status} />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        <div className="mb-6 flex flex-wrap items-center gap-x-6 gap-y-1 text-sm text-slate-500">
          {session.summary && <p className="w-full text-slate-600">{session.summary}</p>}
          <span>Difficulty {session.difficulty}/5</span>
          <span>Time limit {session.timeLimitMinutes} min</span>
          {session.topicTags.length > 0 && (
            <span className="flex flex-wrap gap-1">
              {session.topicTags.map((t) => (
                <span key={t} className="rounded bg-slate-200 px-2 py-0.5 text-xs text-slate-600">
                  {t}
                </span>
              ))}
            </span>
          )}
          {session.scheduledFor && (
            <span>
              Scheduled:{" "}
              {new Date(session.scheduledFor).toLocaleString(undefined, {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </span>
          )}
        </div>

        {session.type === "quiz" ? (
          <QuizForm
            session={session}
            questions={questions}
            initialAnswers={session.answerPayload ?? {}}
          />
        ) : (
          <CodeForm session={session} />
        )}
      </main>
    </div>
  );
}
