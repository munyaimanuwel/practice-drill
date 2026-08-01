export type SessionType = "quiz" | "code";
export type SessionStatus =
  | "draft"
  | "ready"
  | "in_progress"
  | "submitted"
  | "grade_requested"
  | "graded"
  | "cancelled";

export interface QuizQuestion {
  id: string;
  prompt: string;
  kind: string;
  topic?: string;
  points?: number;
}

export interface SessionDto {
  id: string;
  type: SessionType;
  status: SessionStatus;
  title: string;
  summary: string | null;
  topicTags: string[];
  difficulty: number;
  timeLimitMinutes: number;
  scheduledFor: string | null;
  createdAt: string;
  openedAt: string | null;
  submittedAt: string | null;
  gradedAt: string | null;
  score: number | null;
  feedback: string | null;
  payload: {
    questions?: QuizQuestion[];
    brief_markdown?: string;
    rubric_markdown?: string;
    language?: string;
    hints?: string[];
  };
  answerPayload: Record<string, string> | null;
  starterPath: string | null;
  submissionPath: string | null;
  hasStarter: boolean;
  hasSubmission: boolean;
}

export async function fetchSession(id: string): Promise<SessionDto> {
  const res = await fetch(`/api/sessions/${id}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load session");
  const data = await res.json();
  return data.session;
}
