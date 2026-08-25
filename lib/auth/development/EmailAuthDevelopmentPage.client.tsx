"use client";

import { useState } from "react";
import { authClient } from "@/lib/better-auth/auth-client";
import { Button } from "@/lib/shadcn/button";
import { Input } from "@/lib/shadcn/input";
import { Label } from "@/lib/shadcn/label";
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

type EmailAuthAction = "sign-in" | "sign-up";

export type EmailAuthOperation = (args: {
  email: string;
  name?: string;
  password: string;
}) => Promise<{ error?: unknown }>;

function getPendingMessage(action: EmailAuthAction | null) {
  if (action === "sign-up") {
    return "Creating the email account…";
  }

  if (action === "sign-in") {
    return "Signing in with email…";
  }

  return "";
}

export function EmailAuthDevelopmentPageView(props: {
  deleteGuest: AuthOperation;
  onSessionChanged: () => Promise<void>;
  sessionDiagnostics: AuthSessionDiagnostics | null;
  sessionError: unknown;
  sessionPending: boolean;
  signInWithEmail: EmailAuthOperation;
  signOut: AuthOperation;
  signUpWithEmail: EmailAuthOperation;
}) {
  const {
    deleteGuest,
    onSessionChanged,
    sessionDiagnostics,
    sessionError,
    sessionPending,
    signInWithEmail,
    signOut,
    signUpWithEmail,
  } = props;
  const [hasOperationError, setHasOperationError] = useState(false);
  const [pendingAction, setPendingAction] = useState<EmailAuthAction | null>(
    null,
  );
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const hasSessionError = Boolean(sessionError);
  const isSessionAvailable = !sessionPending && !hasSessionError;
  const isPending = Boolean(pendingAction);
  const pendingMessage = getPendingMessage(pendingAction);
  const sessionKind = getAuthSessionKind(sessionDiagnostics);

  async function runEmailAction(args: {
    action: EmailAuthAction;
    form: HTMLFormElement;
    operation: EmailAuthOperation;
    successMessage: string;
  }) {
    const { action, form, operation, successMessage } = args;

    if (!form.reportValidity() || isPending || !isSessionAvailable) {
      return;
    }

    const formData = new FormData(form);
    const email = String(formData.get("email") ?? "");
    const nameValue = String(formData.get("name") ?? "");
    const password = String(formData.get("password") ?? "");
    const name = nameValue || undefined;

    setHasOperationError(false);
    setPendingAction(action);
    setStatusMessage(null);

    try {
      const result = await operation({ email, name, password });

      if (result.error) {
        setHasOperationError(true);

        return;
      }

      await onSessionChanged();
      setStatusMessage(successMessage);
    } catch {
      setHasOperationError(true);
    } finally {
      setPendingAction(null);
    }
  }

  async function handleSignUp(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await runEmailAction({
      action: "sign-up",
      form: event.currentTarget,
      operation: signUpWithEmail,
      successMessage: sessionDiagnostics?.isAnonymous
        ? "Guest upgraded to an email account."
        : "Email account created.",
    });
  }

  async function handleSignIn(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await runEmailAction({
      action: "sign-in",
      form: event.currentTarget,
      operation: signInWithEmail,
      successMessage: "Signed in with email.",
    });
  }

  return (
    <div className="space-y-6">
      {sessionDiagnostics?.isAnonymous && (
        <p className="rounded-lg border bg-background p-4 text-sm leading-6">
          Sign up to upgrade the active guest. The guest-data transfer hook runs
          before Better Auth removes the guest.
        </p>
      )}
      <div className="grid gap-6 lg:grid-cols-2">
        <EmailAuthForm
          action="sign-up"
          disabled={isPending || !isSessionAvailable}
          onSubmit={handleSignUp}
        />
        <EmailAuthForm
          action="sign-in"
          disabled={isPending || !isSessionAvailable}
          onSubmit={handleSignIn}
        />
      </div>
      <AuthPendingState active={isPending} message={pendingMessage} />
      <AuthStatus message={statusMessage} />
      <AuthError active={hasOperationError} kind="operation" />
      <p className="text-sm leading-6 text-muted-foreground">
        This foundation keeps Better Auth password defaults. Email verification,
        password recovery, and password reset are out of scope.
      </p>
      <section className="space-y-4" aria-labelledby="email-session-heading">
        <h2 id="email-session-heading" className="text-lg font-semibold">
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

function EmailAuthForm(props: {
  action: EmailAuthAction;
  disabled: boolean;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
}) {
  const { action, disabled, onSubmit } = props;
  const isSignUp = action === "sign-up";
  const heading = isSignUp ? "Create email account" : "Email sign in";
  const buttonLabel = isSignUp ? "Create account" : "Sign in";

  return (
    <form
      className="space-y-4 rounded-xl border bg-background p-5 shadow-xs"
      onSubmit={onSubmit}
    >
      <h2 className="text-lg font-semibold">{heading}</h2>
      {isSignUp && (
        <div className="space-y-2">
          <Label htmlFor={`${action}-name`}>Name</Label>
          <Input
            autoComplete="name"
            disabled={disabled}
            id={`${action}-name`}
            minLength={1}
            name="name"
            required
          />
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor={`${action}-email`}>Email</Label>
        <Input
          autoComplete="email"
          disabled={disabled}
          id={`${action}-email`}
          name="email"
          required
          type="email"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${action}-password`}>Password</Label>
        <Input
          autoComplete={isSignUp ? "new-password" : "current-password"}
          disabled={disabled}
          id={`${action}-password`}
          maxLength={128}
          minLength={8}
          name="password"
          required
          type="password"
        />
      </div>
      <Button disabled={disabled} type="submit">
        {buttonLabel}
      </Button>
    </form>
  );
}

export function EmailAuthDevelopmentPage() {
  const sessionState = authClient.useSession();
  const sessionDiagnostics = createAuthSessionDiagnostics({
    session: sessionState.data,
  });

  async function deleteGuest() {
    const result = await authClient.deleteAnonymousUser();

    return { error: result.error };
  }

  async function signUpWithEmail(args: {
    email: string;
    name?: string;
    password: string;
  }) {
    const { email, name, password } = args;
    const result = await authClient.signUp.email({
      email,
      name: name ?? "",
      password,
    });

    return { error: result.error };
  }

  async function signInWithEmail(args: { email: string; password: string }) {
    const { email, password } = args;
    const result = await authClient.signIn.email({ email, password });

    return { error: result.error };
  }

  async function refreshSession() {
    await sessionState.refetch();
  }

  async function signOut() {
    const result = await authClient.signOut();

    return { error: result.error };
  }

  return (
    <EmailAuthDevelopmentPageView
      deleteGuest={deleteGuest}
      onSessionChanged={refreshSession}
      sessionDiagnostics={sessionDiagnostics}
      sessionError={sessionState.error}
      sessionPending={sessionState.isPending}
      signInWithEmail={signInWithEmail}
      signOut={signOut}
      signUpWithEmail={signUpWithEmail}
    />
  );
}
