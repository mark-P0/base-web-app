"use client";

import { useState } from "react";
import { Button } from "@/lib/shadcn/button";
import { AuthError } from "./AuthError";
import { AuthPendingState } from "./AuthPendingState";
import { AuthStatus } from "./AuthStatus";
import type { AuthSessionKind } from "./session-diagnostics";

type AuthAction = "delete-guest" | "sign-out";

export type AuthOperation = () => Promise<{
  error?: unknown;
}>;

function getPendingMessage(pendingAction: AuthAction | null) {
  if (pendingAction === "delete-guest") {
    return "Deleting the guest and ending the session…";
  }

  if (pendingAction === "sign-out") {
    return "Signing out…";
  }

  return "";
}

export function AuthSessionActions(props: {
  deleteGuest: AuthOperation;
  onSessionChanged: () => Promise<void>;
  sessionKind: AuthSessionKind;
  signOut: AuthOperation;
}) {
  const { deleteGuest, onSessionChanged, sessionKind, signOut } = props;
  const [hasError, setHasError] = useState(false);
  const [pendingAction, setPendingAction] = useState<AuthAction | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const isPending = Boolean(pendingAction);
  const pendingMessage = getPendingMessage(pendingAction);

  async function runAction(args: {
    action: AuthAction;
    operation: AuthOperation;
    successMessage: string;
  }) {
    const { action, operation, successMessage } = args;

    setHasError(false);
    setPendingAction(action);
    setStatusMessage(null);

    try {
      const result = await operation();

      if (result.error) {
        setHasError(true);

        return;
      }

      await onSessionChanged();
      setStatusMessage(successMessage);
    } catch {
      setHasError(true);
    } finally {
      setPendingAction(null);
    }
  }

  async function handleDeleteGuest() {
    await runAction({
      action: "delete-guest",
      operation: deleteGuest,
      successMessage: "Guest deleted and session ended.",
    });
  }

  async function handleSignOut() {
    await runAction({
      action: "sign-out",
      operation: signOut,
      successMessage: "Signed out.",
    });
  }

  return (
    <section
      aria-busy={isPending}
      aria-labelledby="session-actions-heading"
      className="space-y-4 rounded-xl border bg-background p-5 shadow-xs sm:p-6"
    >
      <div>
        <h2 id="session-actions-heading" className="text-lg font-semibold">
          Session actions
        </h2>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          Permanent users keep their account when they sign out. Deleting a
          guest removes its temporary user and ends its session.
        </p>
      </div>

      {sessionKind === "signed-out" && (
        <p className="text-sm text-muted-foreground">
          Sign in on a method page to make a session action available.
        </p>
      )}

      {sessionKind === "anonymous" && (
        <Button
          disabled={isPending}
          onClick={handleDeleteGuest}
          type="button"
          variant="destructive"
        >
          Delete guest and end session
        </Button>
      )}

      {sessionKind === "permanent" && (
        <Button disabled={isPending} onClick={handleSignOut} type="button">
          Sign out
        </Button>
      )}

      <AuthPendingState active={isPending} message={pendingMessage} />
      <AuthStatus message={statusMessage} />
      <AuthError active={hasError} kind="operation" />
    </section>
  );
}
