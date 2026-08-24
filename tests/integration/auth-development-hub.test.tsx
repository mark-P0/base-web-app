import { expect, mock, test } from "bun:test";
import { act, createElement, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { AuthDevelopmentHubView } from "../../lib/auth/development/AuthDevelopmentHub.client";
import { AuthDevelopmentNavigation } from "../../lib/auth/development/AuthDevelopmentNavigation";
import { createAuthSessionDiagnostics } from "../../lib/auth/development/session-diagnostics";

function createAnonymousSessionDiagnostics() {
  const session = {
    session: {
      expiresAt: new Date("2030-01-02T03:04:05.000Z"),
      token: "anonymous-session-token-must-not-render",
    },
    user: {
      email: "guest@example.test",
      emailVerified: false,
      id: "anonymous-user-id",
      isAnonymous: true,
      name: "Temporary guest",
    },
  };

  const diagnostics = createAuthSessionDiagnostics({ session });

  return diagnostics;
}

function createPermanentSessionDiagnostics() {
  const session = {
    session: {
      expiresAt: new Date("2031-02-03T04:05:06.000Z"),
      token: "permanent-session-token-must-not-render",
    },
    user: {
      email: "person@example.test",
      emailVerified: true,
      id: "permanent-user-id",
      isAnonymous: false,
      name: "Permanent user",
    },
  };

  const diagnostics = createAuthSessionDiagnostics({ session });

  return diagnostics;
}

function createSuccessfulOperation() {
  const operation = mock(async () => {
    const result = { error: null };

    return result;
  });

  return operation;
}

function createSessionRefresh() {
  const refreshSession = mock(async () => {});

  return refreshSession;
}

function getButton(args: { container: HTMLElement; name: string }) {
  const { container, name } = args;
  const buttons = Array.from(container.querySelectorAll("button"));
  const button = buttons.find((candidate) => candidate.textContent === name);

  if (!button) {
    throw new Error(`The ${name} button is missing.`);
  }

  return button;
}

async function click(element: HTMLButtonElement) {
  await act(async () => {
    element.click();
  });
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

test("shows signed-out state and all authentication development links", async () => {
  const rendered = await render(
    createElement(
      "div",
      null,
      createElement(AuthDevelopmentNavigation),
      createElement(AuthDevelopmentHubView, {
        deleteGuest: createSuccessfulOperation(),
        onSessionChanged: createSessionRefresh(),
        sessionDiagnostics: null,
        sessionError: null,
        sessionPending: false,
        signOut: createSuccessfulOperation(),
      }),
    ),
  );

  try {
    expect(rendered.container.textContent).toContain(
      "Authentication stateSigned out",
    );
    expect(rendered.container.textContent).toContain(
      "Sign in on a method page",
    );
    expect(
      Array.from(rendered.container.querySelectorAll("a")).map((link) =>
        link.getAttribute("href"),
      ),
    ).toEqual([
      "/dev/auth",
      "/dev/auth/anonymous",
      "/dev/auth/google",
      "/dev/auth/email",
      "/dev/auth/protected",
    ]);
  } finally {
    await rendered.unmount();
  }
});

test("shows anonymous session details and deletes the guest", async () => {
  const deleteGuest = createSuccessfulOperation();
  const signOut = createSuccessfulOperation();
  const refreshSession = createSessionRefresh();
  const rendered = await render(
    createElement(AuthDevelopmentHubView, {
      deleteGuest,
      onSessionChanged: refreshSession,
      sessionDiagnostics: createAnonymousSessionDiagnostics(),
      sessionError: null,
      sessionPending: false,
      signOut,
    }),
  );

  try {
    expect(rendered.container.textContent).toContain(
      "Authentication stateAnonymous session",
    );
    expect(rendered.container.textContent).toContain(
      "User IDanonymous-user-id",
    );
    expect(rendered.container.textContent).toContain("NameTemporary guest");
    expect(rendered.container.textContent).toContain("Emailguest@example.test");
    expect(rendered.container.textContent).toContain(
      "Email verificationNot verified",
    );
    expect(rendered.container.textContent).toContain("Anonymous userYes");
    expect(rendered.container.textContent).toContain(
      "Session expiry2030-01-02T03:04:05.000Z",
    );
    expect(rendered.container.textContent).not.toContain(
      "anonymous-session-token-must-not-render",
    );

    await click(
      getButton({
        container: rendered.container,
        name: "Delete guest and end session",
      }),
    );

    expect(deleteGuest).toHaveBeenCalledTimes(1);
    expect(signOut).not.toHaveBeenCalled();
    expect(refreshSession).toHaveBeenCalledTimes(1);
    expect(rendered.container.textContent).toContain(
      "Guest deleted and session ended.",
    );
  } finally {
    await rendered.unmount();
  }
});

test("shows permanent session details and signs out", async () => {
  const deleteGuest = createSuccessfulOperation();
  const signOut = createSuccessfulOperation();
  const refreshSession = createSessionRefresh();
  const rendered = await render(
    createElement(AuthDevelopmentHubView, {
      deleteGuest,
      onSessionChanged: refreshSession,
      sessionDiagnostics: createPermanentSessionDiagnostics(),
      sessionError: null,
      sessionPending: false,
      signOut,
    }),
  );

  try {
    expect(rendered.container.textContent).toContain(
      "Authentication statePermanent session",
    );
    expect(rendered.container.textContent).toContain(
      "Email verificationVerified",
    );
    expect(rendered.container.textContent).toContain("Anonymous userNo");
    expect(rendered.container.textContent).not.toContain(
      "permanent-session-token-must-not-render",
    );

    await click(getButton({ container: rendered.container, name: "Sign out" }));

    expect(signOut).toHaveBeenCalledTimes(1);
    expect(deleteGuest).not.toHaveBeenCalled();
    expect(refreshSession).toHaveBeenCalledTimes(1);
    expect(rendered.container.textContent).toContain("Signed out.");
  } finally {
    await rendered.unmount();
  }
});

test("shows the session pending state without stale details", async () => {
  const rendered = await render(
    createElement(AuthDevelopmentHubView, {
      deleteGuest: createSuccessfulOperation(),
      onSessionChanged: createSessionRefresh(),
      sessionDiagnostics: createPermanentSessionDiagnostics(),
      sessionError: null,
      sessionPending: true,
      signOut: createSuccessfulOperation(),
    }),
  );

  try {
    expect(rendered.container.textContent).toContain(
      "Loading authentication state…",
    );
    expect(rendered.container.textContent).not.toContain("permanent-user-id");
    expect(rendered.container.querySelector("button")).toBeNull();
  } finally {
    await rendered.unmount();
  }
});

test("shows action pending state and disables the active action", async () => {
  let finishOperation = () => {};
  const pendingOperation = mock(
    () =>
      new Promise<{ error: null }>((resolve) => {
        finishOperation = () => {
          resolve({ error: null });
        };
      }),
  );
  const rendered = await render(
    createElement(AuthDevelopmentHubView, {
      deleteGuest: createSuccessfulOperation(),
      onSessionChanged: createSessionRefresh(),
      sessionDiagnostics: createPermanentSessionDiagnostics(),
      sessionError: null,
      sessionPending: false,
      signOut: pendingOperation,
    }),
  );

  try {
    const signOutButton = getButton({
      container: rendered.container,
      name: "Sign out",
    });

    act(() => {
      signOutButton.click();
    });

    expect(signOutButton.disabled).toBe(true);
    expect(rendered.container.textContent).toContain("Signing out…");
    expect(
      rendered.container
        .querySelector("section[aria-labelledby='session-actions-heading']")
        ?.getAttribute("aria-busy"),
    ).toBe("true");

    await act(async () => {
      finishOperation();
    });
  } finally {
    await rendered.unmount();
  }
});

test("hides stale session details and actions after a session error", async () => {
  const rendered = await render(
    createElement(AuthDevelopmentHubView, {
      deleteGuest: createSuccessfulOperation(),
      onSessionChanged: createSessionRefresh(),
      sessionDiagnostics: createPermanentSessionDiagnostics(),
      sessionError: new Error("secret session token"),
      sessionPending: false,
      signOut: createSuccessfulOperation(),
    }),
  );

  try {
    expect(rendered.container.textContent).toContain(
      "Authentication state is unavailable.",
    );
    expect(rendered.container.textContent).not.toContain(
      "secret session token",
    );
    expect(rendered.container.textContent).not.toContain("permanent-user-id");
    expect(rendered.container.querySelector("button")).toBeNull();
  } finally {
    await rendered.unmount();
  }
});

test("sanitizes operation errors", async () => {
  const operation = mock(async () => {
    const result = {
      error: new Error("secret operation token"),
    };

    return result;
  });
  const rendered = await render(
    createElement(AuthDevelopmentHubView, {
      deleteGuest: createSuccessfulOperation(),
      onSessionChanged: createSessionRefresh(),
      sessionDiagnostics: createPermanentSessionDiagnostics(),
      sessionError: null,
      sessionPending: false,
      signOut: operation,
    }),
  );

  try {
    await click(getButton({ container: rendered.container, name: "Sign out" }));

    expect(rendered.container.textContent).toContain(
      "The authentication request failed.",
    );
    expect(rendered.container.textContent).not.toContain(
      "secret operation token",
    );
  } finally {
    await rendered.unmount();
  }
});
