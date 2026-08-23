export default function Home() {
  return (
    <main className="min-h-screen bg-background px-6 py-16 text-foreground sm:px-10">
      <div className="mx-auto flex min-h-[calc(100vh-8rem)] w-full max-w-5xl items-center">
        <div className="w-full space-y-12">
          <header className="max-w-3xl space-y-5">
            <p className="font-mono text-sm font-medium tracking-[0.18em] text-muted-foreground uppercase">
              Reusable application foundation
            </p>
            <h1 className="text-5xl font-semibold tracking-tight sm:text-7xl">
              Base Web App
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">
              A common Next.js foundation for web applications built through
              collaboration between people and coding agents.
            </p>
          </header>

          <div className="grid gap-5 md:grid-cols-2">
            <section className="rounded-2xl border bg-card p-6 text-card-foreground shadow-sm">
              <h2 className="text-lg font-semibold">Current foundation</h2>
              <p className="mt-3 leading-7 text-muted-foreground">
                Next.js, React, TypeScript, Tailwind CSS, Bun, reusable UI
                primitives, diagnostics, and automated tests.
              </p>
            </section>

            <section className="rounded-2xl border bg-card p-6 text-card-foreground shadow-sm">
              <h2 className="text-lg font-semibold">Intended database</h2>
              <p className="mt-3 leading-7 text-muted-foreground">
                MongoDB is the intended database for applications that need
                persistent data. This base does not integrate it yet.
              </p>
            </section>
          </div>

          <aside className="border-l-2 pl-5">
            <h2 className="font-medium">Start a derived project</h2>
            <p className="mt-2 max-w-3xl leading-7 text-muted-foreground">
              Replace this page, the application metadata, and the package
              identity. Then add only the services and product features that the
              new application needs.
            </p>
          </aside>
        </div>
      </div>
    </main>
  );
}
