import { expect, mock, test } from "bun:test";
import { act, createElement, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { AnonymousAuthDevelopmentPageView } from "../../lib/auth/development/AnonymousAuthDevelopmentPage.client";
import { AuthDevelopmentHubView } from "../../lib/auth/development/AuthDevelopmentHub.client";
import { AuthDevelopmentNavigation } from "../../lib/auth/development/AuthDevelopmentNavigation";
import { EmailAuthDevelopmentPageView } from "../../lib/auth/development/EmailAuthDevelopmentPage.client";
import { GoogleAuthDevelopmentPageView } from "../../lib/auth/development/GoogleAuthDevelopmentPage.client";
import type { AuthSessionDiagnostics } from "../../lib/auth/development/session-diagnostics";

type SharedAuthState = {
  sessionDiagnostics: AuthSessionDiagnostics | null;
};

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

function createRegisteredSessionDiagnostics(args: {
  email: string;
  name: string;
  userId: string;
}) {
  const { email, name, userId } = args;
  const diagnostics: AuthSessionDiagnostics = {
    email,
    emailVerified: true,
    expiresAt: "2031-02-03T04:05:06.000Z",
    isAnonymous: false,
    name,
    userId,
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

function getButton(args: { container: HTMLElement; name: string }) {
  const { container, name } = args;
  const buttons = Array.from(container.querySelectorAll("button"));
  const button = buttons.find((candidate) => candidate.textContent === name);

  if (!button) {
    throw new Error(`The ${name} button is missing.`);
  }

  return button;
}

function getInput(args: { container: HTMLElement; id: string }) {
  const { container, id } = args;
  const input = container.querySelector(`#${id}`);

  if (!(input instanceof HTMLInputElement)) {
    throw new Error(`The ${id} input is missing.`);
  }

  return input;
}

function completeSignUpForm(args: { container: HTMLElement }) {
  const { container } = args;

  getInput({ container, id: "email-sign-up-name" }).value = "Email user";
  getInput({ container, id: "email-sign-up-email" }).value =
    "email-user@example.test";
  getInput({ container, id: "email-sign-up-password" }).value = "password123";
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

  async function rerender(nextComponent: ReactNode) {
    await act(async () => {
      root.render(nextComponent);
    });
  }

  async function unmount() {
    await act(async () => {
      root.unmount();
    });
    container.remove();
  }

  const renderedComponent = { container, rerender, unmount };

  return renderedComponent;
}

test("links every authentication development flow", async () => {
  const rendered = await render(createElement(AuthDevelopmentNavigation));

  try {
    const links = Array.from(rendered.container.querySelectorAll("a")).map(
      (link) => ({
        href: link.getAttribute("href"),
        label: link.textContent,
      }),
    );

    expect(links).toEqual([
      { href: "/dev/auth", label: "Session hub" },
      { href: "/dev/auth/anonymous", label: "Anonymous" },
      { href: "/dev/auth/google", label: "Google" },
      { href: "/dev/auth/email", label: "Email" },
      { href: "/dev/auth/protected", label: "Protected page" },
    ]);
  } finally {
    await rendered.unmount();
  }
});

test("shares an anonymous session with the email upgrade flow", async () => {
  const sharedAuthState: SharedAuthState = { sessionDiagnostics: null };
  const deleteGuest = createSuccessfulOperation();
  const sessionRefresh = mock(async () => {});
  const signInAnonymous = mock(async () => {
    sharedAuthState.sessionDiagnostics = createAnonymousSessionDiagnostics();
    const result = { error: null };

    return result;
  });
  const signInEmail = createSuccessfulOperation();
  const signInGoogle = createSuccessfulOperation();
  const signOut = createSuccessfulOperation();
  const signUpEmail = mock(
    async (args: { email: string; name: string; password: string }) => {
      const { email, name } = args;

      sharedAuthState.sessionDiagnostics = createRegisteredSessionDiagnostics({
        email,
        name,
        userId: "email-user-id",
      });
      const result = { error: null };

      return result;
    },
  );
  const rendered = await render(
    createElement(AnonymousAuthDevelopmentPageView, {
      deleteGuest,
      onSessionChanged: sessionRefresh,
      sessionDiagnostics: sharedAuthState.sessionDiagnostics,
      sessionError: null,
      sessionPending: false,
      signInAnonymous,
      signOut,
    }),
  );

  try {
    await click(
      getButton({
        container: rendered.container,
        name: "Create anonymous session",
      }),
    );

    expect(signInAnonymous).toHaveBeenCalledTimes(1);
    expect(sessionRefresh).toHaveBeenCalledTimes(1);

    await rendered.rerender(
      createElement(EmailAuthDevelopmentPageView, {
        deleteGuest,
        onSessionChanged: sessionRefresh,
        sessionDiagnostics: sharedAuthState.sessionDiagnostics,
        sessionError: null,
        sessionPending: false,
        signInEmail,
        signOut,
        signUpEmail,
      }),
    );

    expect(rendered.container.textContent).toContain(
      "Authentication stateAnonymous session",
    );
    completeSignUpForm({ container: rendered.container });
    await click(
      getButton({
        container: rendered.container,
        name: "Upgrade guest with email",
      }),
    );

    expect(signUpEmail).toHaveBeenCalledWith({
      email: "email-user@example.test",
      name: "Email user",
      password: "password123",
    });
    expect(sessionRefresh).toHaveBeenCalledTimes(2);

    await rendered.rerender(
      createElement(AuthDevelopmentHubView, {
        deleteGuest,
        onSessionChanged: sessionRefresh,
        sessionDiagnostics: sharedAuthState.sessionDiagnostics,
        sessionError: null,
        sessionPending: false,
        signOut,
      }),
    );

    expect(rendered.container.textContent).toContain(
      "Authentication stateRegistered user session",
    );
    expect(rendered.container.textContent).toContain("User IDemail-user-id");
    expect(signInEmail).not.toHaveBeenCalled();
    expect(signInGoogle).not.toHaveBeenCalled();
    expect(deleteGuest).not.toHaveBeenCalled();
    expect(signOut).not.toHaveBeenCalled();
  } finally {
    await rendered.unmount();
  }
});

test("isolates Google upgrade and shares its callback session", async () => {
  const sharedAuthState: SharedAuthState = {
    sessionDiagnostics: createAnonymousSessionDiagnostics(),
  };
  const deleteGuest = createSuccessfulOperation();
  const sessionRefresh = mock(async () => {});
  const signInEmail = createSuccessfulOperation();
  const signInGoogle = createSuccessfulOperation();
  const signOut = createSuccessfulOperation();
  const signUpEmail = createSuccessfulOperation();
  const rendered = await render(
    createElement(GoogleAuthDevelopmentPageView, {
      deleteGuest,
      isGoogleConfigured: true,
      onSessionChanged: sessionRefresh,
      sessionDiagnostics: sharedAuthState.sessionDiagnostics,
      sessionError: null,
      sessionPending: false,
      signInGoogle,
      signOut,
    }),
  );

  try {
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
    expect(sessionRefresh).not.toHaveBeenCalled();
    expect(signInEmail).not.toHaveBeenCalled();
    expect(signUpEmail).not.toHaveBeenCalled();

    sharedAuthState.sessionDiagnostics = createRegisteredSessionDiagnostics({
      email: "google-user@example.test",
      name: "Google user",
      userId: "google-user-id",
    });

    await rendered.rerender(
      createElement(EmailAuthDevelopmentPageView, {
        deleteGuest,
        onSessionChanged: sessionRefresh,
        sessionDiagnostics: sharedAuthState.sessionDiagnostics,
        sessionError: null,
        sessionPending: false,
        signInEmail,
        signOut,
        signUpEmail,
      }),
    );

    expect(rendered.container.textContent).toContain(
      "Authentication stateRegistered user session",
    );
    expect(rendered.container.textContent).toContain(
      "Sign out before you use another email account.",
    );
    expect(
      getButton({
        container: rendered.container,
        name: "Registered user session is active",
      }).disabled,
    ).toBe(true);
  } finally {
    await rendered.unmount();
  }
});

test("shares guest deletion with the other method pages", async () => {
  const sharedAuthState: SharedAuthState = {
    sessionDiagnostics: createAnonymousSessionDiagnostics(),
  };
  const sessionRefresh = mock(async () => {});
  const signInAnonymous = createSuccessfulOperation();
  const signOut = createSuccessfulOperation();
  const deleteGuest = mock(async () => {
    sharedAuthState.sessionDiagnostics = null;
    const result = { error: null };

    return result;
  });
  const rendered = await render(
    createElement(AuthDevelopmentHubView, {
      deleteGuest,
      onSessionChanged: sessionRefresh,
      sessionDiagnostics: sharedAuthState.sessionDiagnostics,
      sessionError: null,
      sessionPending: false,
      signOut,
    }),
  );

  try {
    await click(
      getButton({
        container: rendered.container,
        name: "Delete guest and end session",
      }),
    );

    expect(deleteGuest).toHaveBeenCalledTimes(1);
    expect(sessionRefresh).toHaveBeenCalledTimes(1);
    expect(signOut).not.toHaveBeenCalled();

    await rendered.rerender(
      createElement(AnonymousAuthDevelopmentPageView, {
        deleteGuest,
        onSessionChanged: sessionRefresh,
        sessionDiagnostics: sharedAuthState.sessionDiagnostics,
        sessionError: null,
        sessionPending: false,
        signInAnonymous,
        signOut,
      }),
    );

    expect(rendered.container.textContent).toContain(
      "Authentication stateSigned out",
    );
    expect(
      getButton({
        container: rendered.container,
        name: "Create anonymous session",
      }).disabled,
    ).toBe(false);
    expect(signInAnonymous).not.toHaveBeenCalled();
  } finally {
    await rendered.unmount();
  }
});
