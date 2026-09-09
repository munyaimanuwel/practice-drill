import { CodeIcon, QuizIcon } from "@/components/icons";

export function SessionTypeBadge({ type }: { type: "quiz" | "code" }) {
  const base = "inline-flex items-center gap-1 rounded-sm px-2 py-0.5 text-xs font-medium";
  return type === "quiz" ? (
    <span className={`${base} bg-info-soft text-info-soft-foreground`}>
      <QuizIcon className="h-3.5 w-3.5" title="" />
      Quiz
    </span>
  ) : (
    <span className={`${base} bg-success-soft text-success-soft-foreground`}>
      <CodeIcon className="h-3.5 w-3.5" title="" />
      Code
    </span>
  );
}

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  ready: "bg-success-soft text-success-soft-foreground",
  in_progress: "bg-warning-soft text-warning-soft-foreground",
  submitted: "bg-info-soft text-info-soft-foreground",
  grade_requested: "bg-secondary-soft text-secondary-soft-foreground",
  graded: "bg-foreground text-background",
  cancelled: "bg-destructive-soft text-destructive-soft-foreground",
};

export function StatusBadge({ status }: { status: string }) {
  const label = status.replace(/_/g, " ");
  return (
    <span
      className={`inline-flex items-center rounded-sm px-2 py-0.5 font-mono text-[11px] font-medium capitalize ${
        STATUS_STYLES[status] ?? "bg-muted text-muted-foreground"
      }`}
    >
      {label}
    </span>
  );
}

export function DifficultyTicks({ value }: { value: number }) {
  const n = Math.min(5, Math.max(0, value));
  return (
    <span className="inline-flex items-end gap-0.5" aria-label={`Difficulty ${n} of 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          className={`w-1 rounded-sm ${i < n ? "bg-primary" : "bg-muted"}`}
          style={{ height: `${8 + i * 2}px` }}
        />
      ))}
    </span>
  );
}
