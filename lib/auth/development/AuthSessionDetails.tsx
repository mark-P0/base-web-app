import {
  type AuthSessionDiagnostics,
  type AuthSessionKind,
  getAuthSessionKind,
} from "./session-diagnostics";

function getAuthenticationState(sessionKind: AuthSessionKind) {
  if (sessionKind === "anonymous") {
    return "Anonymous session";
  }

  if (sessionKind === "permanent") {
    return "Permanent session";
  }

  if (sessionKind === "signed-out") {
    return "Signed out";
  }

  sessionKind satisfies never;

  return "Unavailable";
}

function getAnonymousState(isAnonymous: boolean) {
  if (isAnonymous) {
    return "Yes";
  }

  return "No";
}

function getVerificationState(emailVerified: boolean) {
  if (emailVerified) {
    return "Verified";
  }

  return "Not verified";
}

function SessionValue(props: { label: string; value: string }) {
  const { label, value } = props;

  return (
    <div className="rounded-lg border bg-background p-4 shadow-xs">
      <dt className="font-mono text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </dt>
      <dd className="mt-2 break-words font-medium">{value}</dd>
    </div>
  );
}

export function AuthSessionDetails(props: {
  diagnostics: AuthSessionDiagnostics | null;
}) {
  const { diagnostics } = props;
  const sessionKind = getAuthSessionKind(diagnostics);
  const authenticationState = getAuthenticationState(sessionKind);

  if (!diagnostics) {
    return (
      <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <SessionValue
          label="Authentication state"
          value={authenticationState}
        />
        <SessionValue label="User ID" value="Not available" />
        <SessionValue label="Name" value="Not available" />
        <SessionValue label="Email" value="Not available" />
        <SessionValue label="Email verification" value="Not available" />
        <SessionValue label="Anonymous user" value="Not available" />
        <SessionValue label="Session expiry" value="Not available" />
      </dl>
    );
  }

  const anonymousState = getAnonymousState(diagnostics.isAnonymous);
  const verificationState = getVerificationState(diagnostics.emailVerified);

  return (
    <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <SessionValue label="Authentication state" value={authenticationState} />
      <SessionValue label="User ID" value={diagnostics.userId} />
      <SessionValue label="Name" value={diagnostics.name} />
      <SessionValue label="Email" value={diagnostics.email} />
      <SessionValue label="Email verification" value={verificationState} />
      <SessionValue label="Anonymous user" value={anonymousState} />
      <SessionValue label="Session expiry" value={diagnostics.expiresAt} />
    </dl>
  );
}
