export function LoadingIndicator() {
  return (
    <main
      aria-busy="true"
      className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-10"
    >
      <div className="flex items-center gap-3 rounded-xl border bg-background px-5 py-4 shadow-xs">
        <span
          aria-hidden="true"
          className="size-5 animate-spin rounded-full border-2 border-muted-foreground border-t-primary"
        />
        <output aria-live="polite" className="text-sm text-muted-foreground">
          Loading…
        </output>
      </div>
    </main>
  );
}
