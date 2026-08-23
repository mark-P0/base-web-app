import Link from "next/link";
import type { ReactNode } from "react";

export function DevelopmentPreviewPage(props: {
  actions?: ReactNode;
  children?: ReactNode;
  description: string;
  title: string;
}) {
  const { actions, children, description, title } = props;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
      <header className="space-y-3">
        <p className="text-sm font-medium text-muted-foreground">
          Development preview
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
        <p className="max-w-2xl leading-7 text-muted-foreground">
          {description}
        </p>
      </header>
      {children}
      {Boolean(actions) && (
        <div className="flex flex-wrap gap-3">{actions}</div>
      )}
      <Link
        className="w-fit text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
        href="/dev/next-handlers"
      >
        Back to handler previews
      </Link>
    </main>
  );
}
