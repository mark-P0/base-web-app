import { expect, test } from "bun:test";
import type { ReactNode } from "react";
import { act, createElement, StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { DarkModeDevelopmentPage } from "../../lib/dark-mode/development-page.client";
import { applyThemeToDocument } from "../../lib/dark-mode/document";
import { THEME_CHANGE_EVENT } from "../../lib/dark-mode/theme";
import { ThemeToggle } from "../../lib/dark-mode/toggle.client";
import { installMatchMedia } from "./match-media";

const initializationScript = await Bun.file("public/dark-mode-init.js").text();
const rootLayoutSource = await Bun.file("app/layout.tsx").text();

test("keeps the root layout theme markup contracts", () => {
  expect(rootLayoutSource).toContain("suppressHydrationWarning");
  expect(rootLayoutSource).toContain('<script src="/dark-mode-init.js" />');
  expect(rootLayoutSource).toContain("<ThemeToggle />");
});

test("initializes saved, missing, invalid, explicit, and system modes", () => {
  const cases = [
    { matches: false, mode: "dark", expectedClass: true, expectedMode: "dark" },
    { matches: true, mode: null, expectedClass: true, expectedMode: "system" },
    {
      matches: false,
      mode: "invalid",
      expectedClass: false,
      expectedMode: "system",
    },
    {
      matches: true,
      mode: "light",
      expectedClass: false,
      expectedMode: "light",
    },
    {
      matches: false,
      mode: "system",
      expectedClass: false,
      expectedMode: "system",
    },
  ];

  for (const testCase of cases) {
    const { matches, mode, expectedClass, expectedMode } = testCase;

    document.documentElement.removeAttribute("class");
    document.documentElement.removeAttribute("data-theme");
    localStorage.clear();
    installMatchMedia({ matches });

    if (mode) {
      localStorage.setItem("theme", mode);
    }

    runInitializationScript();

    expect(document.documentElement.dataset.theme).toBe(expectedMode);
    expect(document.documentElement.classList.contains("dark")).toBe(
      expectedClass,
    );
  }
});

test("keeps the server-rendered theme when initialization storage fails", () => {
  const descriptor = Object.getOwnPropertyDescriptor(window, "localStorage");

  Object.defineProperty(window, "localStorage", {
    configurable: true,
    value: {
      getItem() {
        throw new Error("Storage is unavailable");
      },
    },
  });

  try {
    document.documentElement.classList.add("server-class");
    document.documentElement.dataset.theme = "server-theme";

    runInitializationScript();

    expect(document.documentElement.dataset.theme).toBe("server-theme");
    expect(document.documentElement.classList.contains("server-class")).toBe(
      true,
    );
  } finally {
    if (descriptor) {
      Object.defineProperty(window, "localStorage", descriptor);
    } else {
      Reflect.deleteProperty(window, "localStorage");
    }
  }
});

test("cycles modes, persists selections, updates the root, and announces changes", async () => {
  const media = installMatchMedia({ matches: false });
  applyThemeToDocument({ document, mode: "system", prefersDark: false });
  const rendered = await render(createElement(ThemeToggle));

  try {
    const toggle = getThemeToggle();

    expect(toggle.tagName).toBe("BUTTON");
    expect(toggle.type).toBe("button");
    expect(toggle.className).toContain("size-11");
    expect(toggle.className).toContain("focus-visible:ring-[3px]");
    expect(toggle.className).toContain(
      "right-[max(1rem,env(safe-area-inset-right))]",
    );
    expect(toggle.className).toContain(
      "md:right-[max(1.5rem,env(safe-area-inset-right))]",
    );
    expect(toggle.className).toContain(
      "bottom-[max(1rem,env(safe-area-inset-bottom))]",
    );
    expect(toggle.className).toContain(
      "md:bottom-[max(1.5rem,env(safe-area-inset-bottom))]",
    );
    expect(toggle.getAttribute("aria-label")).toBe(
      "Theme mode is System. Activate to switch to Light.",
    );
    expect(toggle.querySelector("svg")?.getAttribute("class")).toContain(
      "lucide-monitor",
    );

    toggle.focus();
    expect(document.activeElement).toBe(toggle);

    await click(toggle);
    expect(localStorage.getItem("theme")).toBe("light");
    expect(document.documentElement.dataset.theme).toBe("light");
    expect(document.documentElement.classList.contains("dark")).toBe(false);
    expect(toggle.getAttribute("aria-label")).toBe(
      "Theme mode is Light. Activate to switch to Dark.",
    );
    expect(toggle.querySelector("svg")?.getAttribute("class")).toContain(
      "lucide-sun",
    );
    expect(getStatusMessage()).toBe("Theme mode changed to Light.");

    await click(toggle);
    expect(localStorage.getItem("theme")).toBe("dark");
    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(toggle.querySelector("svg")?.getAttribute("class")).toContain(
      "lucide-moon",
    );
    expect(getStatusMessage()).toBe("Theme mode changed to Dark.");

    await click(toggle);
    expect(localStorage.getItem("theme")).toBe("system");
    expect(document.documentElement.dataset.theme).toBe("system");
    expect(document.documentElement.classList.contains("dark")).toBe(false);
    expect(getStatusMessage()).toBe("Theme mode changed to System.");

    media.setMatches(true);
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  } finally {
    await rendered.unmount();
  }
});

test("ignores system-preference changes for explicit modes", async () => {
  const media = installMatchMedia({ matches: false });
  applyThemeToDocument({ document, mode: "light", prefersDark: false });
  const rendered = await render(createElement(ThemeToggle));

  try {
    media.setMatches(true);

    expect(document.documentElement.dataset.theme).toBe("light");
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  } finally {
    await rendered.unmount();
  }
});

test("applies changes when persistence fails", async () => {
  const storage = window.localStorage;
  const setItem = storage.setItem;

  storage.setItem = function setItemFailure() {
    throw new Error("Storage is unavailable");
  };

  const rendered = await render(createElement(ThemeToggle));

  try {
    await click(getThemeToggle());

    expect(document.documentElement.dataset.theme).toBe("light");
    expect(getStatusMessage()).toBe("Theme mode changed to Light.");
  } finally {
    storage.setItem = setItem;
    await rendered.unmount();
  }
});

test("reapplies the initialized mode during Strict Mode remounts", async () => {
  installMatchMedia({ matches: true });
  document.documentElement.dataset.theme = "system";
  let eventCount = 0;

  document.addEventListener(THEME_CHANGE_EVENT, countThemeChange);
  const rendered = await render(
    createElement(StrictMode, null, createElement(ThemeToggle)),
  );

  try {
    expect(document.documentElement.dataset.theme).toBe("system");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(eventCount).toBeGreaterThanOrEqual(2);
  } finally {
    document.removeEventListener(THEME_CHANGE_EVENT, countThemeChange);
    await rendered.unmount();
  }

  function countThemeChange() {
    eventCount += 1;
  }
});

test("synchronizes the diagnostics page after toggle and system changes", async () => {
  const media = installMatchMedia({ matches: false });
  applyThemeToDocument({ document, mode: "system", prefersDark: false });
  const rendered = await render(
    createElement(
      "div",
      null,
      createElement(ThemeToggle),
      createElement(DarkModeDevelopmentPage),
    ),
  );

  try {
    expect(rendered.container.textContent).toContain("Selected modesystem");
    expect(rendered.container.textContent).toContain("Effective themelight");
    expect(rendered.container.textContent).toContain("Operating systemLight");
    expect(rendered.container.textContent).toContain(
      "localStorage theme(missing)",
    );

    await click(getThemeToggle());
    expect(rendered.container.textContent).toContain("Selected modelight");
    expect(rendered.container.textContent).toContain("localStorage themelight");

    await click(getThemeToggle());
    expect(rendered.container.textContent).toContain("Selected modedark");
    expect(rendered.container.textContent).toContain("Effective themedark");

    await click(getThemeToggle());
    await act(async () => {
      media.setMatches(true);
    });

    expect(rendered.container.textContent).toContain("Selected modesystem");
    expect(rendered.container.textContent).toContain("Effective themedark");
    expect(rendered.container.textContent).toContain("Operating systemDark");
    expect(rendered.container.textContent).toContain(
      "localStorage themesystem",
    );
  } finally {
    await rendered.unmount();
  }
});

async function click(element: HTMLButtonElement) {
  await act(async () => {
    element.click();
  });
}

function getStatusMessage() {
  const status = document.querySelector("span[aria-live='polite']");

  if (!status) {
    throw new Error("The theme status message is missing.");
  }

  const message = status.textContent ?? "";

  return message;
}

function getThemeToggle() {
  const toggle = document.querySelector<HTMLButtonElement>(
    "button[aria-label^='Theme mode is']",
  );

  if (!toggle) {
    throw new Error("The theme toggle is missing.");
  }

  return toggle;
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

  return { container, unmount };
}

function runInitializationScript() {
  // biome-ignore lint/security/noGlobalEval: The test runs the exact public initialization script.
  window.eval(initializationScript);
}
