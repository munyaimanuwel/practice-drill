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

export function AppHeader({ trailing }: { trailing?: ReactNode }) {
  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-3 pl-8">
        <Link href="/sessions" className="shrink-0 rounded-sm">
          <BrandLockup />
        </Link>
        {trailing ? <div className="flex shrink-0 items-center gap-3">{trailing}</div> : null}
      </div>
    </header>
  );
}

export function AppFrame({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <DrillSpine />
      {children}
    </div>
  );
}
