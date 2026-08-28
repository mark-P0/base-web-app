import { expect, mock, test } from "bun:test";
import { act, createElement, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { GoogleAuthDevelopmentPageView } from "../../lib/auth/development/GoogleAuthDevelopmentPage.client";
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

function createRegisteredSessionDiagnostics() {
  const diagnostics: AuthSessionDiagnostics = {
    email: "person@example.test",
    emailVerified: true,
    expiresAt: "2031-02-03T04:05:06.000Z",
    isAnonymous: false,
    name: "Registered user",
    userId: "registered-user-id",
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

test("starts configured Google sign-in with the fixed return path", async () => {
  const signInGoogle = createSuccessfulOperation();
  const rendered = await render(
    createElement(GoogleAuthDevelopmentPageView, {
      deleteGuest: createSuccessfulOperation(),
      isGoogleConfigured: true,
      onSessionChanged: createSessionRefresh(),
      sessionDiagnostics: null,
      sessionError: null,
      sessionPending: false,
      signInGoogle,
      signOut: createSuccessfulOperation(),
    }),
  );

  try {
    expect(rendered.container.textContent).toContain("Google is configured.");
    expect(rendered.container.textContent).toContain(
      "Their values stay on the server.",
    );
    expect(rendered.container.textContent).toContain(
      "/api/auth/callback/google, then returns the browser to /dev/auth/google.",
    );

    await click(
      getButton({
        container: rendered.container,
        name: "Continue with Google",
      }),
    );

    expect(signInGoogle).toHaveBeenCalledTimes(1);
    expect(signInGoogle).toHaveBeenCalledWith({
      callbackURL: "/dev/auth/google",
      provider: "google",
    });
    expect(rendered.container.textContent).toContain(
      "Google redirect started.",
    );
  } finally {
    await rendered.unmount();
  }
});

test("disables Google sign-in when credentials are absent", async () => {
  const signInGoogle = createSuccessfulOperation();
  const rendered = await render(
    createElement(GoogleAuthDevelopmentPageView, {
      deleteGuest: createSuccessfulOperation(),
      isGoogleConfigured: false,
      onSessionChanged: createSessionRefresh(),
      sessionDiagnostics: null,
      sessionError: null,
      sessionPending: false,
      signInGoogle,
      signOut: createSuccessfulOperation(),
    }),
  );

  try {
    expect(rendered.container.textContent).toContain(
      "Google is not configured.",
    );
    expect(rendered.container.textContent).toContain(
      "Other authentication methods remain available",
    );
    expect(rendered.container.textContent).toContain(
      "A partial configuration is invalid.",
    );
    expect(rendered.container.textContent).toContain(
      "stops startup when only one Google environment variable is set.",
    );

    const continueButton = getButton({
      container: rendered.container,
      name: "Continue with Google",
    });
    expect(continueButton.disabled).toBe(true);

    await click(continueButton);
    expect(signInGoogle).not.toHaveBeenCalled();
  } finally {
    await rendered.unmount();
  }
});

test("upgrades an anonymous session through Google", async () => {
  const signInGoogle = createSuccessfulOperation();
  const deleteGuest = createSuccessfulOperation();
  const refreshSession = createSessionRefresh();
  const rendered = await render(
    createElement(GoogleAuthDevelopmentPageView, {
      deleteGuest,
      isGoogleConfigured: true,
      onSessionChanged: refreshSession,
      sessionDiagnostics: createAnonymousSessionDiagnostics(),
      sessionError: null,
      sessionPending: false,
      signInGoogle,
      signOut: createSuccessfulOperation(),
    }),
  );

  try {
    expect(rendered.container.textContent).toContain(
      "Authentication stateAnonymous session",
    );
    expect(rendered.container.textContent).toContain(
      "data-transfer hook runs before Better Auth removes the temporary user",
    );

    await click(
      getButton({
        container: rendered.container,
        name: "Upgrade guest with Google",
      }),
    );

    expect(signInGoogle).toHaveBeenCalledWith({
      callbackURL: "/dev/auth/google",
      provider: "google",
    });

    await click(
      getButton({
        container: rendered.container,
        name: "Delete guest and end session",
      }),
    );
    expect(deleteGuest).toHaveBeenCalledTimes(1);
    expect(refreshSession).toHaveBeenCalledTimes(1);
  } finally {
    await rendered.unmount();
  }
});

test("prevents Google sign-in while a registered user session is active", async () => {
  const signInGoogle = createSuccessfulOperation();
  const signOut = createSuccessfulOperation();
  const refreshSession = createSessionRefresh();
  const rendered = await render(
    createElement(GoogleAuthDevelopmentPageView, {
      deleteGuest: createSuccessfulOperation(),
      isGoogleConfigured: true,
      onSessionChanged: refreshSession,
      sessionDiagnostics: createRegisteredSessionDiagnostics(),
      sessionError: null,
      sessionPending: false,
      signInGoogle,
      signOut,
    }),
  );

  try {
    const activeButton = getButton({
      container: rendered.container,
      name: "Registered user session is active",
    });
    expect(activeButton.disabled).toBe(true);

    await click(activeButton);
    expect(signInGoogle).not.toHaveBeenCalled();

    await click(getButton({ container: rendered.container, name: "Sign out" }));
    expect(signOut).toHaveBeenCalledTimes(1);
    expect(refreshSession).toHaveBeenCalledTimes(1);
  } finally {
    await rendered.unmount();
  }
});

test("prevents Google sign-in while session state is pending or unavailable", async () => {
  const pendingSignIn = createSuccessfulOperation();
  const pendingRendered = await render(
    createElement(GoogleAuthDevelopmentPageView, {
      deleteGuest: createSuccessfulOperation(),
      isGoogleConfigured: true,
      onSessionChanged: createSessionRefresh(),
      sessionDiagnostics: null,
      sessionError: null,
      sessionPending: true,
      signInGoogle: pendingSignIn,
      signOut: createSuccessfulOperation(),
    }),
  );

  try {
    const continueButton = getButton({
      container: pendingRendered.container,
      name: "Continue with Google",
    });
    expect(continueButton.disabled).toBe(true);
    expect(pendingRendered.container.textContent).toContain(
      "Loading authentication state…",
    );

    await click(continueButton);
    expect(pendingSignIn).not.toHaveBeenCalled();
  } finally {
    await pendingRendered.unmount();
  }

  const errorSignIn = createSuccessfulOperation();
  const errorRendered = await render(
    createElement(GoogleAuthDevelopmentPageView, {
      deleteGuest: createSuccessfulOperation(),
      isGoogleConfigured: true,
      onSessionChanged: createSessionRefresh(),
      sessionDiagnostics: createAnonymousSessionDiagnostics(),
      sessionError: new Error("private session error"),
      sessionPending: false,
      signInGoogle: errorSignIn,
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

test("disables repeated Google redirect submissions", async () => {
  let finishOperation = () => {};
  const signInGoogle = mock(
    () =>
      new Promise<{ error: null }>((resolve) => {
        finishOperation = () => {
          resolve({ error: null });
        };
      }),
  );
  const rendered = await render(
    createElement(GoogleAuthDevelopmentPageView, {
      deleteGuest: createSuccessfulOperation(),
      isGoogleConfigured: true,
      onSessionChanged: createSessionRefresh(),
      sessionDiagnostics: null,
      sessionError: null,
      sessionPending: false,
      signInGoogle,
      signOut: createSuccessfulOperation(),
    }),
  );

  try {
    const continueButton = getButton({
      container: rendered.container,
      name: "Continue with Google",
    });

    act(() => {
      continueButton.click();
    });

    const pendingButton = getButton({
      container: rendered.container,
      name: "Opening Google…",
    });
    expect(pendingButton.disabled).toBe(true);
    expect(signInGoogle).toHaveBeenCalledTimes(1);
    expect(
      rendered.container
        .querySelector(
          "section[aria-labelledby='google-authentication-heading']",
        )
        ?.getAttribute("aria-busy"),
    ).toBe("true");

    await click(pendingButton);
    expect(signInGoogle).toHaveBeenCalledTimes(1);

    await act(async () => {
      finishOperation();
    });
  } finally {
    await rendered.unmount();
  }
});

test("sanitizes Google authentication failures", async () => {
  const signInGoogle = mock(async () => {
    const result = { error: new Error("private Google OAuth error") };

    return result;
  });
  const rendered = await render(
    createElement(GoogleAuthDevelopmentPageView, {
      deleteGuest: createSuccessfulOperation(),
      isGoogleConfigured: true,
      onSessionChanged: createSessionRefresh(),
      sessionDiagnostics: null,
      sessionError: null,
      sessionPending: false,
      signInGoogle,
      signOut: createSuccessfulOperation(),
    }),
  );

  try {
    await click(
      getButton({
        container: rendered.container,
        name: "Continue with Google",
      }),
    );

    expect(rendered.container.textContent).toContain(
      "The authentication request failed.",
    );
    expect(rendered.container.textContent).not.toContain(
      "private Google OAuth error",
    );
  } finally {
    await rendered.unmount();
  }
});
