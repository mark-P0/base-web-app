import { expect, test } from "bun:test";
import { createAuthSessionDiagnostics } from "../../../lib/auth/development/session-diagnostics";

test("creates diagnostics with safe session fields only", () => {
  const session = {
    session: {
      expiresAt: new Date("2030-01-02T03:04:05.000Z"),
      token: "session-token-must-not-enter-diagnostics",
    },
    user: {
      email: "guest@example.test",
      emailVerified: false,
      id: "anonymous-user-id",
      isAnonymous: true,
      name: "Temporary guest",
      privateField: "private-user-value",
    },
  };
  const diagnostics = createAuthSessionDiagnostics({ session });

  expect(diagnostics).toEqual({
    email: "guest@example.test",
    emailVerified: false,
    expiresAt: "2030-01-02T03:04:05.000Z",
    isAnonymous: true,
    name: "Temporary guest",
    userId: "anonymous-user-id",
  });
  expect(JSON.stringify(diagnostics)).not.toContain(session.session.token);
  expect(JSON.stringify(diagnostics)).not.toContain(session.user.privateField);
});

test("returns null without a session", () => {
  const diagnostics = createAuthSessionDiagnostics({ session: null });

  expect(diagnostics).toBeNull();
});
