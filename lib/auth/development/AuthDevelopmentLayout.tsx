import type { ReactNode } from "react";
import { AuthDevelopmentNavigation } from "./AuthDevelopmentNavigation";

export function AuthDevelopmentLayout(props: { children: ReactNode }) {
  const { children } = props;

  return (
    <main className="min-h-screen bg-muted/30 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-8">
        <header className="space-y-3 border-b pb-8">
          <p className="font-mono text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
            Development / Authentication
          </p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Authentication development
          </h1>
          <p className="max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
            Inspect session state and test each supported authentication method.
          </p>
          <AuthDevelopmentNavigation />
        </header>

        {children}
      </div>
    </main>
  );
}
