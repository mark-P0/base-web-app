import { expect, mock, test } from "bun:test";
import { act, createElement, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { AnonymousAuthDevelopmentPageView } from "../../lib/auth/development/AnonymousAuthDevelopmentPage.client";
import type { AuthSessionDiagnostics } from "../../lib/auth/development/session-diagnostics";

function createAnonymousSessionDiagnostics() {
  const diagnostics: AuthSessionDiagnostics = {
    email: "guest@example.test",
    emailVerified: false,
    expiresAt: "2030-01-02T03:04:05.000Z",
    isAnonymous: true,
    name: "Temporary guest",
    userId: "anonymous-user-id",
  };

  return diagnostics;
}

function createPermanentSessionDiagnostics() {
  const diagnostics: AuthSessionDiagnostics = {
    email: "person@example.test",
    emailVerified: true,
    expiresAt: "2031-02-03T04:05:06.000Z",
    isAnonymous: false,
    name: "Permanent user",
    userId: "permanent-user-id",
  };

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

test("explains the guest lifecycle and creates an anonymous session", async () => {
  const signInAnonymous = createSuccessfulOperation();
  const refreshSession = createSessionRefresh();
  const rendered = await render(
    createElement(AnonymousAuthDevelopmentPageView, {
      deleteGuest: createSuccessfulOperation(),
      onSessionChanged: refreshSession,
      sessionDiagnostics: null,
      sessionError: null,
      sessionPending: false,
      signInAnonymous,
      signOut: createSuccessfulOperation(),
    }),
  );

  try {
    expect(rendered.container.textContent).toContain(
      "Better Auth creates a temporary user and session.",
    );
    expect(rendered.container.textContent).toContain(
      "data-transfer hook can move application data",
    );
    expect(rendered.container.textContent).toContain(
      "Authentication stateSigned out",
    );

    const createButton = getButton({
      container: rendered.container,
      name: "Create anonymous session",
    });
    expect(createButton.disabled).toBe(false);

    await click(createButton);

    expect(signInAnonymous).toHaveBeenCalledTimes(1);
    expect(refreshSession).toHaveBeenCalledTimes(1);
    expect(rendered.container.textContent).toContain(
      "Anonymous session created.",
    );
  } finally {
    await rendered.unmount();
  }
});

test("prevents a second anonymous login and links to both upgrades", async () => {
  const deleteGuest = createSuccessfulOperation();
  const signInAnonymous = createSuccessfulOperation();
  const refreshSession = createSessionRefresh();
  const rendered = await render(
    createElement(AnonymousAuthDevelopmentPageView, {
      deleteGuest,
      onSessionChanged: refreshSession,
      sessionDiagnostics: createAnonymousSessionDiagnostics(),
      sessionError: null,
      sessionPending: false,
      signInAnonymous,
      signOut: createSuccessfulOperation(),
    }),
  );

  try {
    const activeButton = getButton({
      container: rendered.container,
      name: "Anonymous session is active",
    });
    expect(activeButton.disabled).toBe(true);

    await click(activeButton);

    expect(signInAnonymous).not.toHaveBeenCalled();
    expect(rendered.container.textContent).toContain(
      "Authentication stateAnonymous session",
    );
    expect(
      rendered.container.querySelector("a[href='/dev/auth/google']")
        ?.textContent,
    ).toBe("Upgrade with Google");
    expect(
      rendered.container.querySelector("a[href='/dev/auth/email']")
        ?.textContent,
    ).toBe("Upgrade with email");

    await click(
      getButton({
        container: rendered.container,
        name: "Delete guest and end session",
      }),
    );

    expect(deleteGuest).toHaveBeenCalledTimes(1);
    expect(refreshSession).toHaveBeenCalledTimes(1);
    expect(rendered.container.textContent).toContain(
      "Guest deleted and session ended.",
    );
  } finally {
    await rendered.unmount();
  }
});

test("prevents anonymous login while a permanent session is active", async () => {
  const signInAnonymous = createSuccessfulOperation();
  const signOut = createSuccessfulOperation();
  const refreshSession = createSessionRefresh();
  const rendered = await render(
    createElement(AnonymousAuthDevelopmentPageView, {
      deleteGuest: createSuccessfulOperation(),
      onSessionChanged: refreshSession,
      sessionDiagnostics: createPermanentSessionDiagnostics(),
      sessionError: null,
      sessionPending: false,
      signInAnonymous,
      signOut,
    }),
  );

  try {
    const activeButton = getButton({
      container: rendered.container,
      name: "Another session is active",
    });
    expect(activeButton.disabled).toBe(true);

    await click(activeButton);

    expect(signInAnonymous).not.toHaveBeenCalled();
    expect(rendered.container.textContent).toContain(
      "Authentication statePermanent session",
    );
    expect(
      rendered.container.querySelector("a[href='/dev/auth/google']"),
    ).toBeNull();
    expect(
      rendered.container.querySelector("a[href='/dev/auth/email']"),
    ).toBeNull();

    await click(getButton({ container: rendered.container, name: "Sign out" }));

    expect(signOut).toHaveBeenCalledTimes(1);
    expect(refreshSession).toHaveBeenCalledTimes(1);
  } finally {
    await rendered.unmount();
  }
});

test("prevents login while session state is pending or unavailable", async () => {
  const pendingSignIn = createSuccessfulOperation();
  const pendingRendered = await render(
    createElement(AnonymousAuthDevelopmentPageView, {
      deleteGuest: createSuccessfulOperation(),
      onSessionChanged: createSessionRefresh(),
      sessionDiagnostics: null,
      sessionError: null,
      sessionPending: true,
      signInAnonymous: pendingSignIn,
      signOut: createSuccessfulOperation(),
    }),
  );

  try {
    const createButton = getButton({
      container: pendingRendered.container,
      name: "Create anonymous session",
    });
    expect(createButton.disabled).toBe(true);
    expect(pendingRendered.container.textContent).toContain(
      "Loading authentication state…",
    );
    expect(
      pendingRendered.container.querySelector(
        "section[aria-labelledby='session-actions-heading']",
      ),
    ).toBeNull();

    await click(createButton);
    expect(pendingSignIn).not.toHaveBeenCalled();
  } finally {
    await pendingRendered.unmount();
  }

  const errorSignIn = createSuccessfulOperation();
  const errorRendered = await render(
    createElement(AnonymousAuthDevelopmentPageView, {
      deleteGuest: createSuccessfulOperation(),
      onSessionChanged: createSessionRefresh(),
      sessionDiagnostics: createAnonymousSessionDiagnostics(),
      sessionError: new Error("private session error"),
      sessionPending: false,
      signInAnonymous: errorSignIn,
      signOut: createSuccessfulOperation(),
    }),
  );

  try {
    expect(errorRendered.container.textContent).toContain(
      "Authentication state is unavailable.",
    );
    expect(errorRendered.container.textContent).not.toContain(
      "private session error",
    );
    expect(errorRendered.container.textContent).not.toContain(
      "anonymous-user-id",
    );
    expect(
      errorRendered.container.querySelector(
        "section[aria-labelledby='session-actions-heading']",
      ),
    ).toBeNull();
  } finally {
    await errorRendered.unmount();
  }
});

test("shows pending state and disables repeated login submissions", async () => {
  let finishOperation = () => {};
  const signInAnonymous = mock(
    () =>
      new Promise<{ error: null }>((resolve) => {
        finishOperation = () => {
          resolve({ error: null });
        };
      }),
  );
  const rendered = await render(
    createElement(AnonymousAuthDevelopmentPageView, {
      deleteGuest: createSuccessfulOperation(),
      onSessionChanged: createSessionRefresh(),
      sessionDiagnostics: null,
      sessionError: null,
      sessionPending: false,
      signInAnonymous,
      signOut: createSuccessfulOperation(),
    }),
  );

  try {
    const createButton = getButton({
      container: rendered.container,
      name: "Create anonymous session",
    });

    act(() => {
      createButton.click();
    });

    const pendingButton = getButton({
      container: rendered.container,
      name: "Creating anonymous session…",
    });
    expect(pendingButton.disabled).toBe(true);
    expect(signInAnonymous).toHaveBeenCalledTimes(1);
    expect(
      rendered.container
        .querySelector(
          "section[aria-labelledby='anonymous-authentication-heading']",
        )
        ?.getAttribute("aria-busy"),
    ).toBe("true");

    await click(pendingButton);
    expect(signInAnonymous).toHaveBeenCalledTimes(1);

    await act(async () => {
      finishOperation();
    });
  } finally {
    await rendered.unmount();
  }
});

test("sanitizes anonymous login failures", async () => {
  const signInAnonymous = mock(async () => {
    const result = { error: new Error("private anonymous login error") };

    return result;
  });
  const rendered = await render(
    createElement(AnonymousAuthDevelopmentPageView, {
      deleteGuest: createSuccessfulOperation(),
      onSessionChanged: createSessionRefresh(),
      sessionDiagnostics: null,
      sessionError: null,
      sessionPending: false,
      signInAnonymous,
      signOut: createSuccessfulOperation(),
    }),
  );

  try {
    await click(
      getButton({
        container: rendered.container,
        name: "Create anonymous session",
      }),
    );

    expect(rendered.container.textContent).toContain(
      "The authentication request failed.",
    );
    expect(rendered.container.textContent).not.toContain(
      "private anonymous login error",
    );
  } finally {
    await rendered.unmount();
  }
});
