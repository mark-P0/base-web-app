"use client";

import { authClient } from "@/lib/better-auth/auth-client";
import { AuthError } from "./AuthError";
import { AuthPendingState } from "./AuthPendingState";
import {
  type AuthOperation,
  AuthSessionActions,
} from "./AuthSessionActions.client";
import { AuthSessionDetails } from "./AuthSessionDetails";
import {
  type AuthSessionDiagnostics,
  createAuthSessionDiagnostics,
  getAuthSessionKind,
} from "./session-diagnostics";

export function AuthDevelopmentHubView(props: {
  deleteGuest: AuthOperation;
  onSessionChanged: () => Promise<void>;
  sessionDiagnostics: AuthSessionDiagnostics | null;
  sessionError: unknown;
  sessionPending: boolean;
  signOut: AuthOperation;
}) {
  const {
    deleteGuest,
    onSessionChanged,
    sessionDiagnostics,
    sessionError,
    sessionPending,
    signOut,
  } = props;
  const hasSessionError = Boolean(sessionError);
  const isSessionAvailable = !sessionPending && !hasSessionError;
  const sessionKind = getAuthSessionKind(sessionDiagnostics);

  return (
    <div className="space-y-6">
      <section aria-labelledby="session-state-heading" className="space-y-4">
        <div>
          <h2 id="session-state-heading" className="text-lg font-semibold">
            Active session
          </h2>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            This view shows safe identity and session diagnostics. It does not
            show session tokens.
          </p>
        </div>

        <AuthPendingState
          active={sessionPending}
          message="Loading authentication state…"
        />
        <AuthError active={hasSessionError} kind="session" />
        {isSessionAvailable && (
          <AuthSessionDetails diagnostics={sessionDiagnostics} />
        )}
      </section>

      {isSessionAvailable && (
        <AuthSessionActions
          deleteGuest={deleteGuest}
          onSessionChanged={onSessionChanged}
          sessionKind={sessionKind}
          signOut={signOut}
        />
      )}
    </div>
  );
}

export function AuthDevelopmentHub() {
  const sessionState = authClient.useSession();
  const sessionDiagnostics = createAuthSessionDiagnostics({
    session: sessionState.data,
  });

  async function deleteGuest() {
    const result = await authClient.deleteAnonymousUser();
    const operationResult = { error: result.error };

    return operationResult;
  }

  async function signOut() {
    const result = await authClient.signOut();
    const operationResult = { error: result.error };

    return operationResult;
  }

  async function refreshSession() {
    await sessionState.refetch();
  }

  return (
    <AuthDevelopmentHubView
      deleteGuest={deleteGuest}
      onSessionChanged={refreshSession}
      sessionDiagnostics={sessionDiagnostics}
      sessionError={sessionState.error}
      sessionPending={sessionState.isPending}
      signOut={signOut}
    />
  );
}
