"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { fetchSession, type SessionDto } from "@/lib/types";
import { DifficultyTicks, SessionTypeBadge, StatusBadge } from "@/components/badges";
import QuizForm from "@/components/quiz-form";
import CodeForm from "@/components/code-form";
import { AppFrame, AppHeader } from "@/components/app-header";
import { ClockIcon } from "@/components/icons";

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
      <AppFrame>
        <AppHeader />
        <div id="main" className="mx-auto max-w-3xl px-6 py-16 pl-8 text-center">
          <p className="text-muted-foreground">{error}</p>
          <Link href="/sessions" className="mt-4 inline-block text-sm text-primary underline">
            Back to sessions
          </Link>
        </div>
      </AppFrame>
    );
  }

  if (!session) {
    return (
      <AppFrame>
        <AppHeader />
        <div id="main" className="mx-auto max-w-3xl px-6 py-16 pl-8 text-center text-muted-foreground">
          Loading…
        </div>
      </AppFrame>
    );
  }

  const questions = session.payload.questions ?? [];

  return (
    <AppFrame>
      <AppHeader
        trailing={
          <>
            <SessionTypeBadge type={session.type} />
            <StatusBadge status={session.status} />
          </>
        }
      />

      <main id="main" className="mx-auto max-w-5xl px-6 py-8 pl-8">
        <p className="mb-3 text-sm">
          <Link href="/sessions" className="text-primary hover:underline">
            All sessions
          </Link>
        </p>

        <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">{session.title}</h1>
        {session.summary && <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{session.summary}</p>}

        <dl className="mt-5 mb-8 flex flex-wrap items-center gap-x-6 gap-y-2 border-y border-border py-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <dt className="sr-only">Difficulty</dt>
            <dd>
              <DifficultyTicks value={session.difficulty} />
            </dd>
          </div>
          <div className="flex items-center gap-1.5">
            <ClockIcon className="h-3.5 w-3.5" />
            <dt className="sr-only">Time limit</dt>
            <dd className="font-mono text-xs">{session.timeLimitMinutes} min</dd>
          </div>
          {session.scheduledFor && (
            <div>
              <dt className="sr-only">Scheduled</dt>
              <dd className="font-mono text-xs">
                {new Date(session.scheduledFor).toLocaleString(undefined, {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </dd>
            </div>
          )}
          {session.topicTags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {session.topicTags.map((t) => (
                <span key={t} className="rounded-sm bg-muted px-2 py-0.5 font-mono text-xs text-muted-foreground">
                  {t}
                </span>
              ))}
            </div>
          )}
        </dl>

        {session.type === "quiz" ? (
          <QuizForm session={session} questions={questions} initialAnswers={session.answerPayload ?? {}} />
        ) : (
          <CodeForm session={session} />
        )}
      </main>
    </AppFrame>
  );
}
