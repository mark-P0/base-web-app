import { expect, mock, test } from "bun:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  ProtectedAuthDevelopmentPage,
  requireProtectedSession,
} from "../../lib/auth/development/ProtectedAuthDevelopmentPage";

function createSession() {
  return {
    session: {
      expiresAt: new Date("2030-01-02T03:04:05.000Z"),
      token: "protected-token-must-not-render",
    },
    user: {
      email: "person@example.test",
      emailVerified: true,
      id: "person-id",
      isAnonymous: false,
      name: "Person",
    },
  };
}

test("returns a database-validated session and renders safe details", async () => {
  const session = createSession();
  const getSession = mock(async () => session);
  const redirectUnauthenticated = mock((): never => {
    throw new Error("Unexpected redirect");
  });
  const result = await requireProtectedSession({
    getSession,
    redirectUnauthenticated,
  });
  const markup = renderToStaticMarkup(
    createElement(ProtectedAuthDevelopmentPage, { session: result }),
  );

  expect(getSession).toHaveBeenCalledTimes(1);
  expect(redirectUnauthenticated).not.toHaveBeenCalled();
  expect(markup).toContain("Protected content");
  expect(markup).toContain("person-id");
  expect(markup).not.toContain("protected-token-must-not-render");
});

test("redirects when database validation returns no session", async () => {
  const redirectError = new Error("redirect:/dev/auth");
  const redirectUnauthenticated = mock((): never => {
    throw redirectError;
  });

  expect(
    requireProtectedSession({
      getSession: async () => null,
      redirectUnauthenticated,
    }),
  ).rejects.toBe(redirectError);
  expect(redirectUnauthenticated).toHaveBeenCalledTimes(1);
});
