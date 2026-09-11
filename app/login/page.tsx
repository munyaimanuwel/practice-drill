import { Suspense } from "react";
import LoginForm from "@/components/login-form";
import { BrandLockup } from "@/components/brand-mark";
import { DrillSpine } from "@/components/app-header";

export default function LoginPage() {
  return (
    <main className="grid min-h-screen lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      <aside className="relative hidden overflow-hidden bg-foreground text-background lg:flex lg:flex-col lg:justify-between lg:px-12 lg:py-14">
        <DrillSpine />
        <BrandLockup dark markClassName="h-10 w-10" />
        <p className="relative max-w-md text-sm leading-6 text-background/70">
          Quizzes in the browser. Code in your IDE. Submit, then request a grade.
        </p>
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
