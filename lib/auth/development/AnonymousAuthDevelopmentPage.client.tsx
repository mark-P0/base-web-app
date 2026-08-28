"use client";

import Link from "next/link";
import { useState } from "react";
import { authClient } from "@/lib/better-auth/auth-client";
import { Button } from "@/lib/shadcn/button";
import { AuthError } from "./AuthError";
import { AuthPendingState } from "./AuthPendingState";
import {
  type AuthOperation,
  AuthSessionActions,
} from "./AuthSessionActions.client";
import { AuthSessionDetails } from "./AuthSessionDetails";
import { AuthStatus } from "./AuthStatus";
import {
  type AuthSessionDiagnostics,
  createAuthSessionDiagnostics,
  getAuthSessionKind,
} from "./session-diagnostics";

function getAnonymousSignInButtonLabel(args: {
  isSubmitting: boolean;
  sessionDiagnostics: AuthSessionDiagnostics | null;
}) {
  const { isSubmitting, sessionDiagnostics } = args;

  if (isSubmitting) {
    return "Creating anonymous session…";
  }

  if (sessionDiagnostics?.isAnonymous) {
    return "Anonymous session is active";
  }

  if (sessionDiagnostics) {
    return "Another session is active";
  }

  return "Create anonymous session";
}

export function AnonymousAuthDevelopmentPageView(props: {
  deleteGuest: AuthOperation;
  onSessionChanged: () => Promise<void>;
  sessionDiagnostics: AuthSessionDiagnostics | null;
  sessionError: unknown;
  sessionPending: boolean;
  signInAnonymous: AuthOperation;
  signOut: AuthOperation;
}) {
  const {
    deleteGuest,
    onSessionChanged,
    sessionDiagnostics,
    sessionError,
    sessionPending,
    signInAnonymous,
    signOut,
  } = props;
  const [hasOperationError, setHasOperationError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const hasSessionError = Boolean(sessionError);
  const isSessionAvailable = !sessionPending && !hasSessionError;
  const sessionKind = getAuthSessionKind(sessionDiagnostics);
  const hasActiveSession = Boolean(sessionDiagnostics);
  const isSignInDisabled =
    !isSessionAvailable || hasActiveSession || isSubmitting;
  const buttonLabel = getAnonymousSignInButtonLabel({
    isSubmitting,
    sessionDiagnostics,
  });

  async function handleAnonymousSignIn() {
    if (isSignInDisabled) {
      return;
    }

    setHasOperationError(false);
    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      const result = await signInAnonymous();

      if (result.error) {
        setHasOperationError(true);

        return;
      }

      await onSessionChanged();
      setStatusMessage("Anonymous session created.");
    } catch {
      setHasOperationError(true);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <section
        aria-busy={isSubmitting}
        aria-labelledby="anonymous-authentication-heading"
        className="space-y-4 rounded-xl border bg-background p-5 shadow-xs sm:p-6"
      >
        <div>
          <h2
            id="anonymous-authentication-heading"
            className="text-lg font-semibold"
          >
            Anonymous authentication
          </h2>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Create a temporary user and session without collecting credentials.
          </p>
        </div>

        <ol className="list-decimal space-y-2 pl-5 text-sm leading-6 text-muted-foreground">
          <li>Better Auth creates a temporary user and session.</li>
          <li>
            Google or email authentication can upgrade the guest to a registered
            account.
          </li>
          <li>
            The data-transfer hook can move application data before Better Auth
            removes the guest.
          </li>
          <li>
            Deleting the guest removes the temporary user and ends its session.
          </li>
        </ol>

        <Button
          disabled={isSignInDisabled}
          onClick={handleAnonymousSignIn}
          type="button"
        >
          {buttonLabel}
        </Button>

        <AuthPendingState
          active={isSubmitting}
          message="Creating an anonymous session…"
        />
        <AuthStatus message={statusMessage} />
        <AuthError active={hasOperationError} kind="operation" />
      </section>

      <section
        aria-labelledby="anonymous-session-heading"
        className="space-y-4"
      >
        <h2 id="anonymous-session-heading" className="text-lg font-semibold">
          Current session
        </h2>
        <AuthPendingState
          active={sessionPending}
          message="Loading authentication state…"
        />
        <AuthError active={hasSessionError} kind="session" />
        {isSessionAvailable && (
          <AuthSessionDetails
            diagnostics={sessionDiagnostics}
            variant="compact"
          />
        )}
      </section>

      {isSessionAvailable && sessionKind === "anonymous" && (
        <section
          aria-labelledby="upgrade-guest-heading"
          className="space-y-4 rounded-lg border bg-background p-4 shadow-xs"
        >
          <div>
            <h2 id="upgrade-guest-heading" className="text-lg font-semibold">
              Upgrade this guest
            </h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Continue with Google or email to register this account.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              className="text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
              href="/dev/auth/google"
            >
              Upgrade with Google
            </Link>
            <Link
              className="text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
              href="/dev/auth/email"
            >
              Upgrade with email
            </Link>
          </div>
        </section>
      )}

      {isSessionAvailable && (
        <AuthSessionActions
          deleteGuest={deleteGuest}
          onSessionChanged={onSessionChanged}
          sessionKind={sessionKind}
          signOut={signOut}
          variant="compact"
        />
      )}
    </div>
  );
}

export function AnonymousAuthDevelopmentPage() {
  const sessionState = authClient.useSession();
  const sessionDiagnostics = createAuthSessionDiagnostics({
    session: sessionState.data,
  });

  async function deleteGuest() {
    const result = await authClient.deleteAnonymousUser();
    const operationResult = { error: result.error };

    return operationResult;
  }

  async function signInAnonymous() {
    const result = await authClient.signIn.anonymous();
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
    <AnonymousAuthDevelopmentPageView
      deleteGuest={deleteGuest}
      onSessionChanged={refreshSession}
      sessionDiagnostics={sessionDiagnostics}
      sessionError={sessionState.error}
      sessionPending={sessionState.isPending}
      signInAnonymous={signInAnonymous}
      signOut={signOut}
    />
  );
}
