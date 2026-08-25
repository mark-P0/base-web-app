import { expect, test } from "bun:test";
import { act } from "react";
import { createRoot } from "react-dom/client";
import Home from "../../app/page";

test("presents the repository as a reusable application foundation", async () => {
  const container = document.createElement("div");
  const root = createRoot(container);

  try {
    await act(async () => {
      root.render(<Home />);
    });

    const heading = container.querySelector("h1");

    expect(heading?.textContent).toBe("Base Web App");
    expect(container.textContent).toContain("Reusable application foundation");
    expect(container.textContent).toContain("Database foundation");
    expect(container.textContent).toContain("reusable Better Auth sessions");
    expect(container.textContent).not.toContain("Hello, world!");
  } finally {
    await act(async () => {
      root.unmount();
    });
  }
});
