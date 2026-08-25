import { expect, mock, test } from "bun:test";
import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { EmailAuthDevelopmentPageView } from "../../lib/auth/development/EmailAuthDevelopmentPage.client";

function operation() {
  return mock(async () => ({ error: null }));
}

async function render() {
  const container = document.createElement("div");
  const root = createRoot(container);
  const signInWithEmail = operation();
  const signUpWithEmail = operation();
  const onSessionChanged = mock(async () => {});
  document.body.append(container);
  await act(async () =>
    root.render(
      createElement(EmailAuthDevelopmentPageView, {
        deleteGuest: operation(),
        onSessionChanged,
        sessionDiagnostics: null,
        sessionError: null,
        sessionPending: false,
        signInWithEmail,
        signOut: operation(),
        signUpWithEmail,
      }),
    ),
  );

  return {
    container,
    onSessionChanged,
    root,
    signInWithEmail,
    signUpWithEmail,
  };
}

function setValue(input: HTMLInputElement, value: string) {
  Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    "value",
  )?.set?.call(input, value);
  input.dispatchEvent(new Event("input", { bubbles: true }));
}

async function submit(args: {
  container: HTMLElement;
  formIndex: number;
  values: string[];
}) {
  const { container, formIndex, values } = args;
  const form = container.querySelectorAll("form")[formIndex];
  const inputs = Array.from(form.querySelectorAll("input"));
  inputs.forEach((input, index) => {
    setValue(input, values[index] ?? "");
  });
  await act(async () => form.requestSubmit());
}

test("signs up and signs in with native form constraints", async () => {
  const rendered = await render();

  try {
    const passwordInputs = rendered.container.querySelectorAll(
      "input[type='password']",
    );
    expect(passwordInputs[0]?.getAttribute("minlength")).toBe("8");
    expect(passwordInputs[0]?.getAttribute("maxlength")).toBe("128");
    await submit({
      container: rendered.container,
      formIndex: 0,
      values: ["Ada", "ada@example.test", "password123"],
    });
    expect(rendered.signUpWithEmail).toHaveBeenCalledWith({
      email: "ada@example.test",
      name: "Ada",
      password: "password123",
    });
    await submit({
      container: rendered.container,
      formIndex: 1,
      values: ["ada@example.test", "password123"],
    });
    expect(rendered.signInWithEmail).toHaveBeenCalledWith({
      email: "ada@example.test",
      name: undefined,
      password: "password123",
    });
    expect(rendered.onSessionChanged).toHaveBeenCalledTimes(2);
  } finally {
    await act(async () => rendered.root.unmount());
    rendered.container.remove();
  }
});

test("does not submit invalid email data", async () => {
  const rendered = await render();

  try {
    await submit({
      container: rendered.container,
      formIndex: 1,
      values: ["invalid", "short"],
    });
    expect(rendered.signInWithEmail).not.toHaveBeenCalled();
    expect(rendered.container.textContent).toContain(
      "verification, password recovery, and password reset are out of scope",
    );
  } finally {
    await act(async () => rendered.root.unmount());
    rendered.container.remove();
  }
});
