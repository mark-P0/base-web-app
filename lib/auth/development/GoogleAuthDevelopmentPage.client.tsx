"use client";

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

type GoogleSignInOperation = (args: {
  callbackURL: string;
  provider: "google";
}) => Promise<{
  error?: unknown;
}>;

const GOOGLE_DEVELOPMENT_PAGE_PATH = "/dev/auth/google";

function getGoogleSignInButtonLabel(args: {
  isSubmitting: boolean;
  sessionDiagnostics: AuthSessionDiagnostics | null;
}) {
  const { isSubmitting, sessionDiagnostics } = args;

  if (isSubmitting) {
    return "Opening Google…";
  }

  if (sessionDiagnostics?.isAnonymous) {
    return "Upgrade guest with Google";
  }

  if (sessionDiagnostics) {
    return "Registered user session is active";
  }

  return "Continue with Google";
}

function GoogleConfigurationStatus(props: { isGoogleConfigured: boolean }) {
  const { isGoogleConfigured } = props;

  if (isGoogleConfigured) {
    return (
      <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
        <p className="font-medium">Google is configured.</p>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          The server detected both required Google environment variables. Their
          values stay on the server.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-muted/40 p-4">
      <p className="font-medium">Google is not configured.</p>
      <p className="mt-1 text-sm leading-6 text-muted-foreground">
        Set both GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to enable this
        demonstration. Other authentication methods remain available when both
        variables are absent.
      </p>
    </div>
  );
}

export function GoogleAuthDevelopmentPageView(props: {
  deleteGuest: AuthOperation;
  isGoogleConfigured: boolean;
  onSessionChanged: () => Promise<void>;
  sessionDiagnostics: AuthSessionDiagnostics | null;
  sessionError: unknown;
  sessionPending: boolean;
  signInGoogle: GoogleSignInOperation;
  signOut: AuthOperation;
}) {
  const {
    deleteGuest,
    isGoogleConfigured,
    onSessionChanged,
    sessionDiagnostics,
    sessionError,
    sessionPending,
    signInGoogle,
    signOut,
  } = props;
  const [hasOperationError, setHasOperationError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const hasSessionError = Boolean(sessionError);
  const isSessionAvailable = !sessionPending && !hasSessionError;
  const sessionKind = getAuthSessionKind(sessionDiagnostics);
  const hasRegisteredSession = sessionKind === "registered";
  const isSignInDisabled =
    !isGoogleConfigured ||
    !isSessionAvailable ||
    hasRegisteredSession ||
    isSubmitting;
  const buttonLabel = getGoogleSignInButtonLabel({
    isSubmitting,
    sessionDiagnostics,
  });

  async function handleGoogleSignIn() {
    if (isSignInDisabled) {
      return;
    }

    setHasOperationError(false);
    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      const result = await signInGoogle({
        callbackURL: GOOGLE_DEVELOPMENT_PAGE_PATH,
        provider: "google",
      });

      if (result.error) {
        setHasOperationError(true);

        return;
      }

      setStatusMessage("Google redirect started.");
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
        aria-labelledby="google-authentication-heading"
        className="space-y-4 rounded-xl border bg-background p-5 shadow-xs sm:p-6"
      >
        <div>
          <h2
            id="google-authentication-heading"
            className="text-lg font-semibold"
          >
            Google authentication
          </h2>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Sign in with Google, or link an anonymous user to a registered
            Google account.
          </p>
        </div>

        <GoogleConfigurationStatus isGoogleConfigured={isGoogleConfigured} />

        <p className="text-sm leading-6 text-muted-foreground">
          A partial configuration is invalid. Server environment validation
          stops startup when only one Google environment variable is set.
        </p>

        {sessionKind === "anonymous" && isSessionAvailable && (
          <p className="rounded-lg border bg-muted/40 p-4 text-sm leading-6 text-muted-foreground">
            Better Auth links the Google account to this guest. The
            data-transfer hook runs before Better Auth removes the temporary
            user.
          </p>
        )}

        <Button
          disabled={isSignInDisabled}
          onClick={handleGoogleSignIn}
          type="button"
        >
          {buttonLabel}
        </Button>

        <p className="text-sm leading-6 text-muted-foreground">
          Better Auth handles the Google callback at /api/auth/callback/google,
          then returns the browser to /dev/auth/google.
        </p>

        <AuthPendingState
          active={isSubmitting}
          message="Opening Google authentication…"
        />
        <AuthStatus message={statusMessage} />
        <AuthError active={hasOperationError} kind="operation" />
      </section>

      <section aria-labelledby="google-session-heading" className="space-y-4">
        <h2 id="google-session-heading" className="text-lg font-semibold">
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

export function GoogleAuthDevelopmentPage(props: {
  isGoogleConfigured: boolean;
}) {
  const { isGoogleConfigured } = props;
  const sessionState = authClient.useSession();
  const sessionDiagnostics = createAuthSessionDiagnostics({
    session: sessionState.data,
  });

  async function deleteGuest() {
    const result = await authClient.deleteAnonymousUser();
    const operationResult = { error: result.error };

    return operationResult;
  }

  async function signInGoogle(args: {
    callbackURL: string;
    provider: "google";
  }) {
    const { callbackURL, provider } = args;
    const result = await authClient.signIn.social({
      callbackURL,
      provider,
    });
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
    <GoogleAuthDevelopmentPageView
      deleteGuest={deleteGuest}
      isGoogleConfigured={isGoogleConfigured}
      onSessionChanged={refreshSession}
      sessionDiagnostics={sessionDiagnostics}
      sessionError={sessionState.error}
      sessionPending={sessionState.isPending}
      signInGoogle={signInGoogle}
      signOut={signOut}
    />
  );
}
