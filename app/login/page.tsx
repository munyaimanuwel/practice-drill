import { Suspense } from "react";
import LoginForm from "@/components/login-form";
import { BrandLockup, BrandMark } from "@/components/brand-mark";
import { DrillSpine } from "@/components/app-header";

export default function LoginPage() {
  return (
    <main className="grid min-h-screen lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      <aside className="relative hidden overflow-hidden bg-foreground text-background lg:flex lg:flex-col lg:justify-between lg:px-12 lg:py-14">
        <DrillSpine />
        <BrandLockup dark markClassName="h-10 w-10" />
        <div className="relative max-w-md">
          <p className="font-display text-4xl font-semibold leading-tight tracking-tight">
            Practice like it&apos;s the real room.
          </p>
          <p className="mt-5 text-sm leading-6 text-background/70">
            Quizzes in the browser. Code in your IDE. Submit, then request a grade.
          </p>
        </div>
        <p className="font-mono text-xs text-background/45">Manuwel Munyai</p>
        <BrandMark className="pointer-events-none absolute -bottom-8 -right-8 h-56 w-56 opacity-15" decorative />
      </aside>

      <section className="relative flex items-center justify-center px-6 py-16">
        <div className="absolute left-6 top-6 lg:hidden">
          <BrandLockup />
        </div>
        <Suspense fallback={<div className="text-sm text-muted-foreground">Loading…</div>}>
          <LoginForm />
        </Suspense>
      </section>
    </main>
  );
}
