"use client";

import { type FormEvent, useState } from "react";
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
  type AuthSessionKind,
  createAuthSessionDiagnostics,
  getAuthSessionKind,
} from "./session-diagnostics";

type EmailAction = "sign-in" | "sign-up";
type EmailOperationResult = {
  error?: unknown;
};
type EmailSignInOperation = (args: {
  email: string;
  password: string;
}) => Promise<EmailOperationResult>;
type EmailSignUpOperation = (args: {
  email: string;
  name: string;
  password: string;
}) => Promise<EmailOperationResult>;

const BETTER_AUTH_DEFAULT_MAXIMUM_PASSWORD_LENGTH = 128;
const BETTER_AUTH_DEFAULT_MINIMUM_PASSWORD_LENGTH = 8;

function getFormStringValue(args: { form: HTMLFormElement; name: string }) {
  const { form, name } = args;
  const formData = new FormData(form);
  const value = formData.get(name);

  if (typeof value !== "string") {
    return "";
  }

  return value;
}

function getSignUpButtonLabel(args: {
  pendingAction: EmailAction | null;
  sessionKind: AuthSessionKind;
}) {
  const { pendingAction, sessionKind } = args;

  if (pendingAction === "sign-up") {
    return "Creating email account…";
  }

  if (sessionKind === "anonymous") {
    return "Upgrade guest with email";
  }

  if (sessionKind === "registered") {
    return "Registered user session is active";
  }

  return "Create email account";
}

function getSignInButtonLabel(args: {
  pendingAction: EmailAction | null;
  sessionKind: AuthSessionKind;
}) {
  const { pendingAction, sessionKind } = args;

  if (pendingAction === "sign-in") {
    return "Signing in with email…";
  }

  if (sessionKind === "anonymous") {
    return "Link guest to email account";
  }

  if (sessionKind === "registered") {
    return "Registered user session is active";
  }

  return "Sign in with email";
}

export function EmailAuthDevelopmentPageView(props: {
  deleteGuest: AuthOperation;
  onSessionChanged: () => Promise<void>;
  sessionDiagnostics: AuthSessionDiagnostics | null;
  sessionError: unknown;
  sessionPending: boolean;
  signInEmail: EmailSignInOperation;
  signOut: AuthOperation;
  signUpEmail: EmailSignUpOperation;
}) {
  const {
    deleteGuest,
    onSessionChanged,
    sessionDiagnostics,
    sessionError,
    sessionPending,
    signInEmail,
    signOut,
    signUpEmail,
  } = props;
  const [hasOperationError, setHasOperationError] = useState(false);
  const [pendingAction, setPendingAction] = useState<EmailAction | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const hasSessionError = Boolean(sessionError);
  const isSessionAvailable = !sessionPending && !hasSessionError;
  const sessionKind = getAuthSessionKind(sessionDiagnostics);
  const hasRegisteredSession = sessionKind === "registered";
  const isActionPending = Boolean(pendingAction);
  const areFormsDisabled =
    !isSessionAvailable || hasRegisteredSession || isActionPending;
  const signUpButtonLabel = getSignUpButtonLabel({
    pendingAction,
    sessionKind,
  });
  const signInButtonLabel = getSignInButtonLabel({
    pendingAction,
    sessionKind,
  });

  async function runEmailAction(args: {
    action: EmailAction;
    form: HTMLFormElement;
    operation: () => Promise<EmailOperationResult>;
    successMessage: string;
  }) {
    const { action, form, operation, successMessage } = args;

    setHasOperationError(false);
    setPendingAction(action);
    setStatusMessage(null);

    try {
      const result = await operation();

      if (result.error) {
        setHasOperationError(true);

        return;
      }

      form.reset();
      await onSessionChanged();
      setStatusMessage(successMessage);
    } catch {
      setHasOperationError(true);
    } finally {
      setPendingAction(null);
    }
  }

  async function handleSignUp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (areFormsDisabled) {
      return;
    }

    const form = event.currentTarget;
    const email = getFormStringValue({ form, name: "email" });
    const name = getFormStringValue({ form, name: "name" });
    const password = getFormStringValue({ form, name: "password" });
    let successMessage = "Email account created and signed in.";

    if (sessionKind === "anonymous") {
      successMessage = "Guest upgraded to a registered email account.";
    }

    await runEmailAction({
      action: "sign-up",
      form,
      operation: async () => {
        const result = await signUpEmail({ email, name, password });

        return result;
      },
      successMessage,
    });
  }

  async function handleSignIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (areFormsDisabled) {
      return;
    }

    const form = event.currentTarget;
    const email = getFormStringValue({ form, name: "email" });
    const password = getFormStringValue({ form, name: "password" });
    let successMessage = "Signed in with email.";

    if (sessionKind === "anonymous") {
      successMessage = "Guest linked to the registered email account.";
    }

    await runEmailAction({
      action: "sign-in",
      form,
      operation: async () => {
        const result = await signInEmail({ email, password });

        return result;
      },
      successMessage,
    });
  }

  return (
    <div className="space-y-6">
      <section
        aria-busy={isActionPending}
        aria-labelledby="email-authentication-heading"
        className="space-y-5 rounded-xl border bg-background p-5 shadow-xs sm:p-6"
      >
        <div>
          <h2
            id="email-authentication-heading"
            className="text-lg font-semibold"
          >
            Email and password authentication
          </h2>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Create a registered account or sign in to an existing account.
          </p>
        </div>

        {sessionKind === "anonymous" && isSessionAvailable && (
          <p className="rounded-lg border bg-muted/40 p-4 text-sm leading-6 text-muted-foreground">
            Creating an account upgrades this guest. Signing in links this guest
            to an existing account. The data-transfer hook runs before Better
            Auth removes the temporary user.
          </p>
        )}

        {hasRegisteredSession && isSessionAvailable && (
          <p className="rounded-lg border bg-muted/40 p-4 text-sm leading-6 text-muted-foreground">
            Sign out before you use another email account.
          </p>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          <form
            aria-labelledby="email-sign-up-heading"
            className="space-y-4 rounded-lg border p-4"
            onSubmit={handleSignUp}
          >
            <div>
              <h3 id="email-sign-up-heading" className="font-semibold">
                Create account
              </h3>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Use new credentials to create an account and start a session.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email-sign-up-name">Name</Label>
              <Input
                autoComplete="name"
                disabled={areFormsDisabled}
                id="email-sign-up-name"
                name="name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email-sign-up-email">Email</Label>
              <Input
                autoComplete="email"
                disabled={areFormsDisabled}
                id="email-sign-up-email"
                name="email"
                required
                spellCheck={false}
                type="email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email-sign-up-password">Password</Label>
              <Input
                aria-describedby="email-password-requirements"
                autoComplete="new-password"
                disabled={areFormsDisabled}
                id="email-sign-up-password"
                maxLength={BETTER_AUTH_DEFAULT_MAXIMUM_PASSWORD_LENGTH}
                minLength={BETTER_AUTH_DEFAULT_MINIMUM_PASSWORD_LENGTH}
                name="password"
                required
                type="password"
              />
            </div>

            <Button disabled={areFormsDisabled} type="submit">
              {signUpButtonLabel}
            </Button>
          </form>

          <form
            aria-labelledby="email-sign-in-heading"
            className="space-y-4 rounded-lg border p-4"
            onSubmit={handleSignIn}
          >
            <div>
              <h3 id="email-sign-in-heading" className="font-semibold">
                Sign in
              </h3>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Use credentials for an existing email account.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email-sign-in-email">Email</Label>
              <Input
                autoComplete="email"
                disabled={areFormsDisabled}
                id="email-sign-in-email"
                name="email"
                required
                spellCheck={false}
                type="email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email-sign-in-password">Password</Label>
              <Input
                aria-describedby="email-password-requirements"
                autoComplete="current-password"
                disabled={areFormsDisabled}
                id="email-sign-in-password"
                maxLength={BETTER_AUTH_DEFAULT_MAXIMUM_PASSWORD_LENGTH}
                minLength={BETTER_AUTH_DEFAULT_MINIMUM_PASSWORD_LENGTH}
                name="password"
                required
                type="password"
              />
            </div>

            <Button disabled={areFormsDisabled} type="submit">
              {signInButtonLabel}
            </Button>
          </form>
        </div>

        <p
          className="text-sm leading-6 text-muted-foreground"
          id="email-password-requirements"
        >
          Passwords must contain 8 to 128 characters. Email verification and
          password recovery are not included in this base implementation.
        </p>

        <AuthPendingState
          active={pendingAction === "sign-up"}
          message="Creating the email account…"
        />
        <AuthPendingState
          active={pendingAction === "sign-in"}
          message="Signing in with email…"
        />
        <AuthStatus message={statusMessage} />
        <AuthError active={hasOperationError} kind="operation" />
      </section>

      <section aria-labelledby="email-session-heading" className="space-y-4">
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

export function EmailAuthDevelopmentPage() {
  const sessionState = authClient.useSession();
  const sessionDiagnostics = createAuthSessionDiagnostics({
    session: sessionState.data,
  });

  async function deleteGuest() {
    const result = await authClient.deleteAnonymousUser();
    const operationResult = { error: result.error };

    return operationResult;
  }

  async function signInEmail(args: { email: string; password: string }) {
    const { email, password } = args;
    const result = await authClient.signIn.email({ email, password });
    const operationResult = { error: result.error };

    return operationResult;
  }

  async function signOut() {
    const result = await authClient.signOut();
    const operationResult = { error: result.error };

    return operationResult;
  }

  async function signUpEmail(args: {
    email: string;
    name: string;
    password: string;
  }) {
    const { email, name, password } = args;
    const result = await authClient.signUp.email({ email, name, password });
    const operationResult = { error: result.error };

    return operationResult;
  }

  async function refreshSession() {
    await sessionState.refetch();
  }

  return (
    <EmailAuthDevelopmentPageView
      deleteGuest={deleteGuest}
      onSessionChanged={refreshSession}
      sessionDiagnostics={sessionDiagnostics}
      sessionError={sessionState.error}
      sessionPending={sessionState.isPending}
      signInEmail={signInEmail}
      signOut={signOut}
      signUpEmail={signUpEmail}
    />
  );
}
