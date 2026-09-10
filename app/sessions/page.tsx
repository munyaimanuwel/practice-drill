import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/api";
import Link from "next/link";
import { DifficultyTicks, SessionTypeBadge, StatusBadge } from "@/components/badges";
import LogoutButton from "@/components/logout-button";
import { AppFrame, AppHeader } from "@/components/app-header";
import { UserIcon } from "@/components/icons";

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
    <AppFrame>
      <AppHeader
        trailing={
          <>
            <span className="hidden items-center gap-1.5 font-mono text-xs text-muted-foreground sm:inline-flex">
              <UserIcon className="h-3.5 w-3.5" />
              {user.name}
            </span>
            <LogoutButton />
          </>
        }
      />

      <main className="mx-auto max-w-5xl px-6 py-8 pl-8">
        <div className="mb-6">
          <h1 className="font-display text-2xl font-semibold tracking-tight">Sessions</h1>
          <p className="mt-1 text-sm text-muted-foreground">Scheduled quizzes and code challenges.</p>
        </div>

        <nav className="flex flex-wrap gap-1 border-b border-border">
          {FILTERS.map((f) => (
            <Link
              key={f.key}
              href={f.key === "all" ? "/sessions" : `/sessions?status=${f.key}`}
              className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium ${
                activeFilter === f.key
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {f.label}
            </Link>
          ))}
        </nav>

        {sessions.length === 0 ? (
          <div className="border-x border-b border-border bg-card px-6 py-16 text-center">
            <p className="text-foreground">No sessions yet.</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Run the seed script or create one via the API. See the README.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-border border-x border-b border-border bg-card">
            {sessions.map((s) => (
              <li key={s.id}>
                <Link
                  href={`/sessions/${s.id}`}
                  className="grid grid-cols-1 gap-3 px-4 py-4 transition-colors duration-150 hover:bg-accent sm:grid-cols-[1fr_auto] sm:items-center sm:gap-6"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <SessionTypeBadge type={s.type} />
                      <StatusBadge status={s.status} />
                    </div>
                    <h2 className="mt-2 truncate font-medium text-foreground">{s.title}</h2>
                    {s.summary && (
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{s.summary}</p>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-5 text-sm sm:flex-col sm:items-end sm:gap-1.5">
                    <DifficultyTicks value={s.difficulty} />
                    <span className="font-mono text-xs text-muted-foreground">{formatDate(s.scheduledFor)}</span>
                    {s.score !== null && (
                      <span className="font-mono text-sm font-medium text-foreground">{s.score}/100</span>
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </AppFrame>
  );
}
