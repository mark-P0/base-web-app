import { expect, mock, test } from "bun:test";
import { act, type ComponentProps, createElement, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { EmailAuthDevelopmentPageView } from "../../lib/auth/development/EmailAuthDevelopmentPage.client";
import type { AuthSessionDiagnostics } from "../../lib/auth/development/session-diagnostics";

type EmailPageProps = ComponentProps<typeof EmailAuthDevelopmentPageView>;

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

function createPageProps(args: { overrides?: Partial<EmailPageProps> } = {}) {
  const { overrides } = args;
  const props: EmailPageProps = {
    deleteGuest: createSuccessfulOperation(),
    onSessionChanged: createSessionRefresh(),
    sessionDiagnostics: null,
    sessionError: null,
    sessionPending: false,
    signInEmail: createSuccessfulOperation(),
    signOut: createSuccessfulOperation(),
    signUpEmail: createSuccessfulOperation(),
    ...overrides,
  };

  return props;
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

function completeSignUpForm(args: {
  container: HTMLElement;
  email?: string;
  name?: string;
  password?: string;
}) {
  const {
    container,
    email = "new-user@example.test",
    name = "New user",
    password = "password123",
  } = args;

  getInput({ container, id: "email-sign-up-name" }).value = name;
  getInput({ container, id: "email-sign-up-email" }).value = email;
  getInput({ container, id: "email-sign-up-password" }).value = password;
}

function completeSignInForm(args: {
  container: HTMLElement;
  email?: string;
  password?: string;
}) {
  const {
    container,
    email = "person@example.test",
    password = "password123",
  } = args;

  getInput({ container, id: "email-sign-in-email" }).value = email;
  getInput({ container, id: "email-sign-in-password" }).value = password;
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

test("uses accessible labels and Better Auth password constraints", async () => {
  const rendered = await render(
    createElement(EmailAuthDevelopmentPageView, createPageProps()),
  );

  try {
    const signUpName = getInput({
      container: rendered.container,
      id: "email-sign-up-name",
    });
    const signUpEmail = getInput({
      container: rendered.container,
      id: "email-sign-up-email",
    });
    const signUpPassword = getInput({
      container: rendered.container,
      id: "email-sign-up-password",
    });
    const signInEmail = getInput({
      container: rendered.container,
      id: "email-sign-in-email",
    });
    const signInPassword = getInput({
      container: rendered.container,
      id: "email-sign-in-password",
    });

    expect(
      rendered.container.querySelector("label[for='email-sign-up-name']")
        ?.textContent,
    ).toBe("Name");
    expect(
      rendered.container.querySelector("label[for='email-sign-up-email']")
        ?.textContent,
    ).toBe("Email");
    expect(
      rendered.container.querySelector("label[for='email-sign-up-password']")
        ?.textContent,
    ).toBe("Password");
    expect(
      rendered.container.querySelector("label[for='email-sign-in-email']")
        ?.textContent,
    ).toBe("Email");
    expect(
      rendered.container.querySelector("label[for='email-sign-in-password']")
        ?.textContent,
    ).toBe("Password");
    expect(signUpName.required).toBe(true);
    expect(signUpEmail.required).toBe(true);
    expect(signUpEmail.type).toBe("email");
    expect(signUpPassword.required).toBe(true);
    expect(signUpPassword.minLength).toBe(8);
    expect(signUpPassword.maxLength).toBe(128);
    expect(signInEmail.required).toBe(true);
    expect(signInEmail.type).toBe("email");
    expect(signInPassword.required).toBe(true);
    expect(signInPassword.minLength).toBe(8);
    expect(signInPassword.maxLength).toBe(128);
    expect(rendered.container.textContent).toContain(
      "Email verification and password recovery are not included",
    );
  } finally {
    await rendered.unmount();
  }
});

test("prevents invalid native form submissions", async () => {
  const signUpEmail = createSuccessfulOperation();
  const signInEmail = createSuccessfulOperation();
  const rendered = await render(
    createElement(
      EmailAuthDevelopmentPageView,
      createPageProps({ overrides: { signInEmail, signUpEmail } }),
    ),
  );

  try {
    completeSignUpForm({
      container: rendered.container,
      email: "invalid-email",
      name: "",
      password: "short",
    });
    completeSignInForm({
      container: rendered.container,
      email: "invalid-email",
      password: "short",
    });

    expect(
      getInput({
        container: rendered.container,
        id: "email-sign-up-name",
      }).checkValidity(),
    ).toBe(false);
    expect(
      getInput({
        container: rendered.container,
        id: "email-sign-up-email",
      }).checkValidity(),
    ).toBe(false);
    expect(
      getInput({
        container: rendered.container,
        id: "email-sign-up-password",
      }).checkValidity(),
    ).toBe(false);
    expect(
      getInput({
        container: rendered.container,
        id: "email-sign-in-email",
      }).checkValidity(),
    ).toBe(false);
    expect(
      getInput({
        container: rendered.container,
        id: "email-sign-in-password",
      }).checkValidity(),
    ).toBe(false);

    await click(
      getButton({
        container: rendered.container,
        name: "Create email account",
      }),
    );
    await click(
      getButton({
        container: rendered.container,
        name: "Sign in with email",
      }),
    );

    expect(signUpEmail).not.toHaveBeenCalled();
    expect(signInEmail).not.toHaveBeenCalled();
  } finally {
    await rendered.unmount();
  }
});

test("creates an email account and refreshes the session", async () => {
  const signUpEmail = createSuccessfulOperation();
  const refreshSession = createSessionRefresh();
  const rendered = await render(
    createElement(
      EmailAuthDevelopmentPageView,
      createPageProps({
        overrides: { onSessionChanged: refreshSession, signUpEmail },
      }),
    ),
  );

  try {
    completeSignUpForm({ container: rendered.container });
    await click(
      getButton({
        container: rendered.container,
        name: "Create email account",
      }),
    );

    expect(signUpEmail).toHaveBeenCalledTimes(1);
    expect(signUpEmail).toHaveBeenCalledWith({
      email: "new-user@example.test",
      name: "New user",
      password: "password123",
    });
    expect(refreshSession).toHaveBeenCalledTimes(1);
    expect(rendered.container.textContent).toContain(
      "Email account created and signed in.",
    );
    expect(
      getInput({
        container: rendered.container,
        id: "email-sign-up-password",
      }).value,
    ).toBe("");
  } finally {
    await rendered.unmount();
  }
});

test("signs in with an existing email account", async () => {
  const signInEmail = createSuccessfulOperation();
  const refreshSession = createSessionRefresh();
  const rendered = await render(
    createElement(
      EmailAuthDevelopmentPageView,
      createPageProps({
        overrides: { onSessionChanged: refreshSession, signInEmail },
      }),
    ),
  );

  try {
    completeSignInForm({ container: rendered.container });
    await click(
      getButton({
        container: rendered.container,
        name: "Sign in with email",
      }),
    );

    expect(signInEmail).toHaveBeenCalledTimes(1);
    expect(signInEmail).toHaveBeenCalledWith({
      email: "person@example.test",
      password: "password123",
    });
    expect(refreshSession).toHaveBeenCalledTimes(1);
    expect(rendered.container.textContent).toContain("Signed in with email.");
  } finally {
    await rendered.unmount();
  }
});

test("upgrades an anonymous user by creating an email account", async () => {
  const signUpEmail = createSuccessfulOperation();
  const refreshSession = createSessionRefresh();
  const rendered = await render(
    createElement(
      EmailAuthDevelopmentPageView,
      createPageProps({
        overrides: {
          onSessionChanged: refreshSession,
          sessionDiagnostics: createAnonymousSessionDiagnostics(),
          signUpEmail,
        },
      }),
    ),
  );

  try {
    expect(rendered.container.textContent).toContain(
      "Creating an account upgrades this guest.",
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

    expect(signUpEmail).toHaveBeenCalledTimes(1);
    expect(refreshSession).toHaveBeenCalledTimes(1);
    expect(rendered.container.textContent).toContain(
      "Guest upgraded to a registered email account.",
    );
  } finally {
    await rendered.unmount();
  }
});

test("links an anonymous user by signing in to an email account", async () => {
  const signInEmail = createSuccessfulOperation();
  const refreshSession = createSessionRefresh();
  const rendered = await render(
    createElement(
      EmailAuthDevelopmentPageView,
      createPageProps({
        overrides: {
          onSessionChanged: refreshSession,
          sessionDiagnostics: createAnonymousSessionDiagnostics(),
          signInEmail,
        },
      }),
    ),
  );

  try {
    completeSignInForm({ container: rendered.container });
    await click(
      getButton({
        container: rendered.container,
        name: "Link guest to email account",
      }),
    );

    expect(signInEmail).toHaveBeenCalledTimes(1);
    expect(refreshSession).toHaveBeenCalledTimes(1);
    expect(rendered.container.textContent).toContain(
      "Guest linked to the registered email account.",
    );
  } finally {
    await rendered.unmount();
  }
});

test("prevents email actions for a registered session and signs out", async () => {
  const signInEmail = createSuccessfulOperation();
  const signOut = createSuccessfulOperation();
  const signUpEmail = createSuccessfulOperation();
  const refreshSession = createSessionRefresh();
  const rendered = await render(
    createElement(
      EmailAuthDevelopmentPageView,
      createPageProps({
        overrides: {
          onSessionChanged: refreshSession,
          sessionDiagnostics: createRegisteredSessionDiagnostics(),
          signInEmail,
          signOut,
          signUpEmail,
        },
      }),
    ),
  );

  try {
    expect(rendered.container.textContent).toContain(
      "Sign out before you use another email account.",
    );
    const activeButtons = Array.from(
      rendered.container.querySelectorAll("button"),
    ).filter(
      (button) => button.textContent === "Registered user session is active",
    );
    expect(activeButtons).toHaveLength(2);
    expect(activeButtons.every((button) => button.disabled)).toBe(true);

    await click(getButton({ container: rendered.container, name: "Sign out" }));

    expect(signInEmail).not.toHaveBeenCalled();
    expect(signUpEmail).not.toHaveBeenCalled();
    expect(signOut).toHaveBeenCalledTimes(1);
    expect(refreshSession).toHaveBeenCalledTimes(1);
  } finally {
    await rendered.unmount();
  }
});

test("disables repeated email account submissions", async () => {
  let finishOperation = () => {};
  const signUpEmail = mock(
    () =>
      new Promise<{ error: null }>((resolve) => {
        finishOperation = () => {
          resolve({ error: null });
        };
      }),
  );
  const rendered = await render(
    createElement(
      EmailAuthDevelopmentPageView,
      createPageProps({ overrides: { signUpEmail } }),
    ),
  );

  try {
    completeSignUpForm({ container: rendered.container });
    const createButton = getButton({
      container: rendered.container,
      name: "Create email account",
    });

    act(() => {
      createButton.click();
    });

    const pendingButton = getButton({
      container: rendered.container,
      name: "Creating email account…",
    });
    expect(pendingButton.disabled).toBe(true);
    expect(signUpEmail).toHaveBeenCalledTimes(1);
    expect(
      rendered.container
        .querySelector(
          "section[aria-labelledby='email-authentication-heading']",
        )
        ?.getAttribute("aria-busy"),
    ).toBe("true");
    expect(rendered.container.textContent).toContain(
      "Creating the email account…",
    );

    await click(pendingButton);
    expect(signUpEmail).toHaveBeenCalledTimes(1);

    await act(async () => {
      finishOperation();
    });
  } finally {
    await rendered.unmount();
  }
});

test("hides stale session data and disables forms when session state fails", async () => {
  const signInEmail = createSuccessfulOperation();
  const signUpEmail = createSuccessfulOperation();
  const rendered = await render(
    createElement(
      EmailAuthDevelopmentPageView,
      createPageProps({
        overrides: {
          sessionDiagnostics: createAnonymousSessionDiagnostics(),
          sessionError: new Error("private session error"),
          signInEmail,
          signUpEmail,
        },
      }),
    ),
  );

  try {
    expect(rendered.container.textContent).toContain(
      "Authentication state is unavailable.",
    );
    expect(rendered.container.textContent).not.toContain(
      "private session error",
    );
    expect(rendered.container.textContent).not.toContain("anonymous-user-id");
    expect(
      getButton({
        container: rendered.container,
        name: "Upgrade guest with email",
      }).disabled,
    ).toBe(true);
    expect(
      getButton({
        container: rendered.container,
        name: "Link guest to email account",
      }).disabled,
    ).toBe(true);
    expect(
      rendered.container.querySelector(
        "section[aria-labelledby='session-actions-heading']",
      ),
    ).toBeNull();
  } finally {
    await rendered.unmount();
  }
});

test("sanitizes email authentication failures", async () => {
  const signInEmail = mock(async () => {
    const result = { error: new Error("private email authentication error") };

    return result;
  });
  const rendered = await render(
    createElement(
      EmailAuthDevelopmentPageView,
      createPageProps({ overrides: { signInEmail } }),
    ),
  );

  try {
    completeSignInForm({ container: rendered.container });
    await click(
      getButton({
        container: rendered.container,
        name: "Sign in with email",
      }),
    );

    expect(rendered.container.textContent).toContain(
      "The authentication request failed.",
    );
    expect(rendered.container.textContent).not.toContain(
      "private email authentication error",
    );
  } finally {
    await rendered.unmount();
  }
});
