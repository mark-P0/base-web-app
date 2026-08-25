"use client";

import { useState } from "react";
import { authClient } from "@/lib/better-auth/auth-client";
import { Button } from "@/lib/shadcn/button";
import { AuthError } from "./AuthError";
import { AuthPendingState } from "./AuthPendingState";
import { AuthSessionDetails } from "./AuthSessionDetails";
import { AuthStatus } from "./AuthStatus";
import {
  type AuthSessionDiagnostics,
  createAuthSessionDiagnostics,
} from "./session-diagnostics";

type GoogleConfigurationStatus = "configured" | "partial" | "unconfigured";

export type GoogleSignInOperation = (args: {
  callbackURL: string;
}) => Promise<{ error?: unknown }>;

function getConfigurationMessage(status: GoogleConfigurationStatus) {
  if (status === "configured") {
    return "Google authentication is configured. Credentials stay on the server.";
  }

  if (status === "unconfigured") {
    return "Google authentication is not configured. Add both Google environment variables to enable it.";
  }

  if (status === "partial") {
    return "Google authentication has partial configuration. Set both Google environment variables or remove both.";
  }

  status satisfies never;

  return "Google authentication configuration is unavailable.";
}

export function GoogleAuthDevelopmentPageView(props: {
  configurationStatus: GoogleConfigurationStatus;
  sessionDiagnostics: AuthSessionDiagnostics | null;
  sessionError: unknown;
  sessionPending: boolean;
  signInWithGoogle: GoogleSignInOperation;
}) {
  const {
    configurationStatus,
    sessionDiagnostics,
    sessionError,
    sessionPending,
    signInWithGoogle,
  } = props;
  const [hasOperationError, setHasOperationError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const hasSessionError = Boolean(sessionError);
  const isConfigured = configurationStatus === "configured";
  const isSessionAvailable = !sessionPending && !hasSessionError;
  const isAnonymousUpgrade = Boolean(sessionDiagnostics?.isAnonymous);
  const configurationMessage = getConfigurationMessage(configurationStatus);

  async function handleGoogleSignIn() {
    if (!isConfigured || isSubmitting || !isSessionAvailable) {
      return;
    }

    setHasOperationError(false);
    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      const result = await signInWithGoogle({
        callbackURL: "/dev/auth/google",
      });

      if (result.error) {
        setHasOperationError(true);

        return;
      }

      setStatusMessage("Redirecting to Google…");
    } catch {
      setHasOperationError(true);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="space-y-4 rounded-xl border bg-background p-5 shadow-xs sm:p-6">
        <div>
          <h2 className="text-lg font-semibold">Google authentication</h2>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            {configurationMessage}
          </p>
        </div>
        {isAnonymousUpgrade && (
          <p className="text-sm leading-6 text-muted-foreground">
            Continue with Google to upgrade the active guest. Better Auth calls
            the guest-data transfer hook before it removes the guest.
          </p>
        )}
        <Button
          disabled={!isConfigured || isSubmitting || !isSessionAvailable}
          onClick={handleGoogleSignIn}
          type="button"
        >
          {isAnonymousUpgrade
            ? "Upgrade guest with Google"
            : "Continue with Google"}
        </Button>
        <AuthPendingState
          active={isSubmitting}
          message="Starting Google authentication…"
        />
        <AuthStatus message={statusMessage} />
        <AuthError active={hasOperationError} kind="operation" />
      </section>

      <section className="space-y-4" aria-labelledby="google-session-heading">
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
    </div>
  );
}

export function GoogleAuthDevelopmentPage(props: {
  configurationStatus: "configured" | "unconfigured";
}) {
  const { configurationStatus } = props;
  const sessionState = authClient.useSession();
  const sessionDiagnostics = createAuthSessionDiagnostics({
    session: sessionState.data,
  });

  async function signInWithGoogle(args: { callbackURL: string }) {
    const { callbackURL } = args;
    const result = await authClient.signIn.social({
      callbackURL,
      provider: "google",
    });
    const operationResult = { error: result.error };

    return operationResult;
  }

  return (
    <GoogleAuthDevelopmentPageView
      configurationStatus={configurationStatus}
      sessionDiagnostics={sessionDiagnostics}
      sessionError={sessionState.error}
      sessionPending={sessionState.isPending}
      signInWithGoogle={signInWithGoogle}
    />
  );
}
