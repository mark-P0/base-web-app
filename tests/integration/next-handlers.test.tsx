import { expect, test } from "bun:test";
import type { ReactNode } from "react";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { ErrorPage } from "../../lib/next-handlers/ErrorPage.client";
import { LoadingIndicator } from "../../lib/next-handlers/LoadingIndicator";
import { StatusPage } from "../../lib/next-handlers/StatusPage";

test("renders a semantic not-found page with home navigation", async () => {
  const rendered = await render(
    <StatusPage
      code="404"
      description="The page you requested does not exist."
      title="Page not found"
    />,
  );

  try {
    const main = rendered.container.querySelector("main");
    const heading = rendered.container.querySelector("h1");
    const homeLink = rendered.container.querySelector("a[href='/']");

    expect(main).not.toBeNull();
    expect(heading?.textContent).toBe("Page not found");
    expect(homeLink?.textContent).toBe("Go to home");
  } finally {
    await rendered.unmount();
  }
});

test("retries errors and shows only the safe digest", async () => {
  let retryCount = 0;
  const error = Object.assign(new Error("Private database failure"), {
    digest: "abc123",
  });
  const rendered = await render(
    <ErrorPage
      error={error}
      retry={() => {
        retryCount += 1;
      }}
    />,
  );

  try {
    const retryButton =
      rendered.container.querySelector<HTMLButtonElement>("button");

    expect(rendered.container.textContent).toContain("Error reference: abc123");
    expect(rendered.container.textContent).not.toContain(
      "Private database failure",
    );
    expect(retryButton?.textContent).toBe("Try again");

    await act(async () => {
      retryButton?.click();
    });

    expect(retryCount).toBe(1);
  } finally {
    await rendered.unmount();
  }
});

test("does not render an error reference without a digest", async () => {
  const rendered = await render(
    <ErrorPage error={new Error("Private failure")} retry={() => {}} />,
  );

  try {
    expect(rendered.container.textContent).not.toContain("Error reference:");
    expect(rendered.container.textContent).not.toContain("Private failure");
  } finally {
    await rendered.unmount();
  }
});

test("announces loading state to assistive technology", async () => {
  const rendered = await render(<LoadingIndicator />);

  try {
    const loadingStatus = rendered.container.querySelector("main");
    const loadingMessage = rendered.container.querySelector("output");

    expect(loadingStatus?.getAttribute("aria-busy")).toBe("true");
    expect(loadingMessage?.getAttribute("aria-live")).toBe("polite");
    expect(loadingStatus?.textContent).toContain("Loading…");
  } finally {
    await rendered.unmount();
  }
});

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

  return { container, unmount };
}
