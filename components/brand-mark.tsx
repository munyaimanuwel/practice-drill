import { useId } from "react";

export function BrandMark({ className }: { className?: string }) {
  const gid = `${useId().replace(/:/g, "")}-g`;

  return (
    <svg className={className} viewBox="0 0 64 64" aria-hidden>
      <defs>
        <linearGradient id={gid} x1="8" y1="4" x2="56" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#2563EB" />
          <stop offset="1" stopColor="#7C3AED" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="12" fill={`url(#${gid})`} />
      <circle cx="32" cy="32" r="18" fill="none" stroke="#fff" strokeWidth="2.75" />
      <path d="M32 12v6M32 46v6M12 32h6M46 32h6" fill="none" stroke="#fff" strokeWidth="2.5" />
      <circle cx="32" cy="32" r="8" fill="none" stroke="#fff" strokeWidth="2.25" opacity="0.85" />
      <path d="M32 27.5 36.5 32 32 36.5 27.5 32Z" fill="#fff" />
    </svg>
  );
}

export function BrandLockup({
  dark = false,
  markClassName = "h-8 w-8",
}: {
  dark?: boolean;
  markClassName?: string;
}) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <BrandMark className={markClassName} />
      <span
        className={`font-display text-lg font-semibold tracking-tight ${
          dark ? "text-background" : "text-foreground"
        }`}
      >
        Interview Drill
      </span>
    </span>
  );
}
