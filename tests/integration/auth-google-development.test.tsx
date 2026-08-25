import { expect, mock, test } from "bun:test";
import { act, createElement, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { GoogleAuthDevelopmentPageView } from "../../lib/auth/development/GoogleAuthDevelopmentPage.client";
import type { AuthSessionDiagnostics } from "../../lib/auth/development/session-diagnostics";

function createSignIn() {
  return mock(async () => ({ error: null }));
}

async function render(component: ReactNode) {
  const container = document.createElement("div");
  const root = createRoot(container);
  document.body.append(container);
  await act(async () => root.render(component));

  return {
    container,
    async unmount() {
      await act(async () => root.unmount());
      container.remove();
    },
  };
}

async function click(container: HTMLElement) {
  const button = container.querySelector("button");

  if (!button) {
    throw new Error("The Google authentication button is missing.");
  }

  await act(async () => button.click());

  return button;
}

test("starts configured Google authentication with a fixed callback", async () => {
  const signInWithGoogle = createSignIn();
  const rendered = await render(
    createElement(GoogleAuthDevelopmentPageView, {
      configurationStatus: "configured",
      sessionDiagnostics: null,
      sessionError: null,
      sessionPending: false,
      signInWithGoogle,
    }),
  );

  try {
    const button = await click(rendered.container);
    expect(button.disabled).toBe(false);
    expect(signInWithGoogle).toHaveBeenCalledWith({
      callbackURL: "/dev/auth/google",
    });
    expect(rendered.container.textContent).toContain("Redirecting to Google…");
  } finally {
    await rendered.unmount();
  }
});

test.each([
  "unconfigured",
  "partial",
] as const)("disables Google authentication for %s configuration", async (configurationStatus) => {
  const signInWithGoogle = createSignIn();
  const rendered = await render(
    createElement(GoogleAuthDevelopmentPageView, {
      configurationStatus,
      sessionDiagnostics: null,
      sessionError: null,
      sessionPending: false,
      signInWithGoogle,
    }),
  );

  try {
    const button = await click(rendered.container);
    expect(button.disabled).toBe(true);
    expect(signInWithGoogle).not.toHaveBeenCalled();
    expect(rendered.container.textContent).not.toContain("client-secret");
  } finally {
    await rendered.unmount();
  }
});

test("explains anonymous-to-Google upgrade", async () => {
  const diagnostics: AuthSessionDiagnostics = {
    email: "guest@example.test",
    emailVerified: false,
    expiresAt: "2030-01-02T03:04:05.000Z",
    isAnonymous: true,
    name: "Guest",
    userId: "guest-id",
  };
  const rendered = await render(
    createElement(GoogleAuthDevelopmentPageView, {
      configurationStatus: "configured",
      sessionDiagnostics: diagnostics,
      sessionError: null,
      sessionPending: false,
      signInWithGoogle: createSignIn(),
    }),
  );

  try {
    expect(rendered.container.textContent).toContain(
      "Upgrade guest with Google",
    );
    expect(rendered.container.textContent).toContain(
      "guest-data transfer hook",
    );
  } finally {
    await rendered.unmount();
  }
});
