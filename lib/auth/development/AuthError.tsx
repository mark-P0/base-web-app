type AuthErrorKind = "operation" | "session";

function getErrorMessage(kind: AuthErrorKind) {
  if (kind === "operation") {
    return "The authentication request failed. Try again.";
  }

  if (kind === "session") {
    return "Authentication state is unavailable. Refresh the page and try again.";
  }

  kind satisfies never;

  return "Authentication is unavailable.";
}

export function AuthError(props: { active: boolean; kind: AuthErrorKind }) {
  const { active, kind } = props;

  if (!active) {
    return null;
  }

  const message = getErrorMessage(kind);

  return (
    <p
      className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
      role="alert"
    >
      {message}
    </p>
  );
}
