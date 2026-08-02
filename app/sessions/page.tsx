import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/api";
import Link from "next/link";
import { SessionTypeBadge, StatusBadge } from "@/components/badges";
import LogoutButton from "@/components/logout-button";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "ready", label: "Ready" },
  { key: "in_progress", label: "In progress" },
  { key: "submitted", label: "Submitted" },
  { key: "grade_requested", label: "Grade requested" },
  { key: "graded", label: "Graded" },
] as const;

function formatDate(d: Date | null): string {
  if (!d) return "—";
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export const dynamic = "force-dynamic";

export default async function SessionsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const { status: active } = await searchParams;
  const activeFilter = active ?? "all";

  const statusFilter =
    activeFilter === "all" ? undefined : [activeFilter] as ("ready" | "in_progress" | "submitted" | "grade_requested" | "graded")[];

  const sessions = await prisma.drillSession.findMany({
    where: {
      userId: user.id,
      status: statusFilter ? { in: statusFilter } : undefined,
    },
    orderBy: [{ scheduledFor: "desc" }, { createdAt: "desc" }],
    take: 50,
  });

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-lg font-semibold text-slate-900">Interview Drill</h1>
            <p className="text-sm text-slate-500">{user.name}</p>
          </div>
          <LogoutButton />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Sessions</h2>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <Link
              key={f.key}
              href={f.key === "all" ? "/sessions" : `/sessions?status=${f.key}`}
              className={`rounded-full px-3 py-1 text-sm font-medium ${
                activeFilter === f.key
                  ? "bg-blue-600 text-white"
                  : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
              }`}
            >
              {f.label}
            </Link>
          ))}
        </div>

        {sessions.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white p-12 text-center">
            <p className="text-slate-500">No sessions yet.</p>
            <p className="mt-1 text-sm text-slate-400">
              Run seed or create via API — see README.
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {sessions.map((s: { id: string; type: "quiz" | "code"; status: string; title: string; summary: string | null; difficulty: number; scheduledFor: Date | null; score: number | null }) => (
              <li key={s.id}>
                <Link
                  href={`/sessions/${s.id}`}
                  className="block rounded-lg border border-slate-200 bg-white p-4 transition hover:border-blue-300 hover:shadow-sm"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <SessionTypeBadge type={s.type} />
                        <StatusBadge status={s.status} />
                      </div>
                      <h3 className="mt-2 truncate font-medium text-slate-900">{s.title}</h3>
                      {s.summary && (
                        <p className="mt-1 line-clamp-2 text-sm text-slate-500">{s.summary}</p>
                      )}
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1 text-sm">
                      {s.scheduledFor && (
                        <span className="text-slate-500">Scheduled {formatDate(s.scheduledFor)}</span>
                      )}
                      <span className="text-slate-400">Difficulty {s.difficulty}/5</span>
                      {s.score !== null && (
                        <span className="font-semibold text-slate-700">{s.score}/100</span>
                      )}
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
