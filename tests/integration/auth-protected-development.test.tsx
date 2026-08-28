import { expect, mock, test } from "bun:test";
import { act, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { ProtectedAuthDevelopmentPage } from "../../lib/auth/development/ProtectedAuthDevelopmentPage";

function createRegisteredSession() {
  const session = {
    session: {
      expiresAt: new Date("2031-02-03T04:05:06.000Z"),
      token: "protected-session-token-must-not-render",
    },
    user: {
      email: "protected@example.test",
      emailVerified: true,
      id: "protected-user-id",
      isAnonymous: false,
      name: "Protected user",
    },
  };

  return session;
}

function getRedirectDigest(error: unknown) {
  if (!(error instanceof Error)) {
    return null;
  }

  if (!("digest" in error) || typeof error.digest !== "string") {
    return null;
  }

  return error.digest;
}

async function render(component: ReactNode) {
  const container = document.createElement("div");
  const root = createRoot(container);

  document.body.append(container);
  await act(async () => {
    root.render(component);
  });

  async function unmount() {
    await act(async () => {
      root.unmount();
    });
    container.remove();
  }

  const renderedComponent = { container, unmount };

  return renderedComponent;
}

test("renders safe content after a database-validated session", async () => {
  const requestHeaders = new Headers({ cookie: "session=private" });
  const session = createRegisteredSession();
  const getSession = mock(async () => session);
  const page = await ProtectedAuthDevelopmentPage({
    getSession,
    requestHeaders,
  });
  const rendered = await render(page);

  try {
    expect(getSession).toHaveBeenCalledWith({
      headers: requestHeaders,
      query: {
        disableCookieCache: true,
      },
    });
    expect(rendered.container.textContent).toContain("Protected content");
    expect(rendered.container.textContent).toContain(
      "Authentication stateRegistered user session",
    );
    expect(rendered.container.textContent).toContain(
      "User IDprotected-user-id",
    );
    expect(rendered.container.textContent).toContain("NameProtected user");
    expect(rendered.container.textContent).toContain(
      "Emailprotected@example.test",
    );
    expect(rendered.container.textContent).not.toContain(
      "protected-session-token-must-not-render",
    );
  } finally {
    await rendered.unmount();
  }
});

test("redirects an unauthenticated request during render", async () => {
  const requestHeaders = new Headers();
  const getSession = mock(async () => null);
  let redirectError: unknown;

  try {
    await ProtectedAuthDevelopmentPage({
      getSession,
      requestHeaders,
    });
  } catch (error) {
    redirectError = error;
  }

  expect(getSession).toHaveBeenCalledWith({
    headers: requestHeaders,
    query: {
      disableCookieCache: true,
    },
  });
  expect(getRedirectDigest(redirectError)).toBe(
    "NEXT_REDIRECT;replace;/dev/auth;307;",
  );
});
