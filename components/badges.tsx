export function SessionTypeBadge({ type }: { type: "quiz" | "code" }) {
  const base = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium";
  return type === "quiz" ? (
    <span className={`${base} bg-info-soft text-info-soft-foreground`}>Quiz</span>
  ) : (
    <span className={`${base} bg-success-soft text-success-soft-foreground`}>Code</span>
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
  const label = status.replace("_", " ");
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[status] ?? "bg-muted text-muted-foreground"}`}>
      {label}
    </span>
  );
}
