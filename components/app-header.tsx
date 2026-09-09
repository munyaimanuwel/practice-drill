import Link from "next/link";
import type { ReactNode } from "react";
import { BrandLockup } from "@/components/brand-mark";

export function DrillSpine() {
  return (
    <div
      className="drill-spine pointer-events-none fixed inset-y-0 left-0 z-20 w-1.5"
      aria-hidden
    />
  );
}

export function AppHeader({
  trailing,
  subtitle,
}: {
  trailing?: ReactNode;
  subtitle?: ReactNode;
}) {
  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-3 pl-8">
        <div className="flex min-w-0 items-center gap-4">
          <Link href="/sessions" className="shrink-0 rounded-sm">
            <BrandLockup />
          </Link>
          {subtitle ? (
            <div className="hidden min-w-0 truncate text-sm text-muted-foreground sm:block">
              {subtitle}
            </div>
          ) : null}
        </div>
        {trailing ? <div className="flex shrink-0 items-center gap-3">{trailing}</div> : null}
      </div>
    </header>
  );
}

export function AppFrame({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-card focus:px-3 focus:py-2 focus:text-sm"
      >
        Skip to content
      </a>
      <DrillSpine />
      {children}
    </div>
  );
}
