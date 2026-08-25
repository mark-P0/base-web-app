import { AuthSessionDetails } from "./AuthSessionDetails";
import {
  type AuthSessionDiagnosticsInput,
  createAuthSessionDiagnostics,
} from "./session-diagnostics";

export async function requireProtectedSession(args: {
  getSession: () => Promise<AuthSessionDiagnosticsInput | null>;
  redirectUnauthenticated: () => never;
}) {
  const { getSession, redirectUnauthenticated } = args;
  const session = await getSession();

  if (!session) {
    return redirectUnauthenticated();
  }

  return session;
}

export function ProtectedAuthDevelopmentPage(props: {
  session: AuthSessionDiagnosticsInput;
}) {
  const { session } = props;
  const diagnostics = createAuthSessionDiagnostics({ session });

  return (
    <section className="space-y-4" aria-labelledby="protected-page-heading">
      <div>
        <h2 id="protected-page-heading" className="text-lg font-semibold">
          Protected content
        </h2>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          The server validated this session against the Better Auth database
          before it rendered this content.
        </p>
      </div>
      <AuthSessionDetails diagnostics={diagnostics} variant="compact" />
    </section>
  );
}
