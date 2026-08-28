export type AuthSessionDiagnostics = {
  email: string;
  emailVerified: boolean;
  expiresAt: string;
  isAnonymous: boolean;
  name: string;
  userId: string;
};

export type AuthSessionKind = "anonymous" | "registered" | "signed-out";

function formatSessionExpiry(expiresAt: Date) {
  if (Number.isNaN(expiresAt.getTime())) {
    return "Unavailable";
  }

  return expiresAt.toISOString();
}

export function createAuthSessionDiagnostics(args: {
  session: {
    session: {
      expiresAt: Date;
    };
    user: {
      email: string;
      emailVerified: boolean;
      id: string;
      isAnonymous?: boolean | null;
      name: string;
    };
  } | null;
}) {
  const { session } = args;

  if (!session) {
    return null;
  }

  const diagnostics: AuthSessionDiagnostics = {
    email: session.user.email,
    emailVerified: session.user.emailVerified,
    expiresAt: formatSessionExpiry(session.session.expiresAt),
    isAnonymous: Boolean(session.user.isAnonymous),
    name: session.user.name,
    userId: session.user.id,
  };

  return diagnostics;
}

export function getAuthSessionKind(diagnostics: AuthSessionDiagnostics | null) {
  if (!diagnostics) {
    const sessionKind: AuthSessionKind = "signed-out";

    return sessionKind;
  }

  if (diagnostics.isAnonymous) {
    const sessionKind: AuthSessionKind = "anonymous";

    return sessionKind;
  }

  const sessionKind: AuthSessionKind = "registered";

  return sessionKind;
}
