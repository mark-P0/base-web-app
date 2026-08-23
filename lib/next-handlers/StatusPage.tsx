import Link from "next/link";
import type { ReactNode } from "react";

export function StatusPage(props: {
  actions?: ReactNode;
  children?: ReactNode;
  code?: string;
  description: string;
  title: string;
}) {
  const { actions, children, code, description, title } = props;

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-10 sm:px-6 lg:px-8">
      <section
        aria-labelledby="status-page-title"
        className="w-full max-w-xl rounded-xl border bg-background p-6 shadow-xs sm:p-8"
      >
        <div className="space-y-5">
          {Boolean(code) && (
            <p className="font-mono text-sm font-medium tracking-[0.18em] text-muted-foreground uppercase">
              {code}
            </p>
          )}
          <div className="space-y-2">
            <h1
              className="text-2xl font-semibold tracking-tight sm:text-3xl"
              id="status-page-title"
            >
              {title}
            </h1>
            <p className="text-sm leading-6 text-muted-foreground sm:text-base">
              {description}
            </p>
          </div>
          {children}
          <div className="flex flex-wrap gap-3">
            <Link
              className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
              href="/"
            >
              Go to home
            </Link>
            {actions}
          </div>
        </div>
      </section>
    </main>
  );
}
