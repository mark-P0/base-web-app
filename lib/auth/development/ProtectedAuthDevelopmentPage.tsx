import { redirect } from "next/navigation";
import { AuthSessionDetails } from "./AuthSessionDetails";
import { createAuthSessionDiagnostics } from "./session-diagnostics";

type ProtectedAuthSession = Parameters<
  typeof createAuthSessionDiagnostics
>[0]["session"];

export type GetProtectedAuthSession = (args: {
  headers: Headers;
  query: {
    disableCookieCache: true;
  };
}) => Promise<ProtectedAuthSession>;

export async function ProtectedAuthDevelopmentPage(props: {
  getSession: GetProtectedAuthSession;
  requestHeaders: Headers;
}) {
  const { getSession, requestHeaders } = props;
  const session = await getSession({
    headers: requestHeaders,
    query: {
      disableCookieCache: true,
    },
  });

  if (!session) {
    redirect("/dev/auth");
  }

  const diagnostics = createAuthSessionDiagnostics({
    session,
  });

  if (!diagnostics) {
    redirect("/dev/auth");
  }

  return (
    <section
      aria-labelledby="protected-content-heading"
      className="space-y-4 rounded-xl border bg-background p-5 shadow-xs sm:p-6"
    >
      <div>
        <h2 id="protected-content-heading" className="text-lg font-semibold">
          Protected content
        </h2>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          The server rendered this content after Better Auth validated the
          session against MongoDB.
        </p>
      </div>

      <AuthSessionDetails diagnostics={diagnostics} variant="full" />

      <p className="text-sm leading-6 text-muted-foreground">
        This page is the security boundary. It validates each request during
        render and does not depend on a proxy check.
      </p>
    </section>
  );
}
