export function SessionTypeBadge({ type }: { type: "quiz" | "code" }) {
  const base = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium";
  return type === "quiz" ? (
    <span className={`${base} bg-blue-100 text-blue-800`}>Quiz</span>
  ) : (
    <span className={`${base} bg-emerald-100 text-emerald-800`}>Code</span>
  );
}

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-slate-100 text-slate-700",
  ready: "bg-green-100 text-green-800",
  in_progress: "bg-amber-100 text-amber-800",
  submitted: "bg-blue-100 text-blue-800",
  grade_requested: "bg-purple-100 text-purple-800",
  graded: "bg-slate-800 text-white",
  cancelled: "bg-red-100 text-red-700",
};

export function StatusBadge({ status }: { status: string }) {
  const label = status.replace("_", " ");
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[status] ?? "bg-slate-100 text-slate-700"}`}>
      {label}
    </span>
  );
}
