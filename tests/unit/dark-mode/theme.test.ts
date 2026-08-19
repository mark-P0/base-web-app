import { describe, expect, test } from "bun:test";
import {
  cycleThemeMode,
  getStoredThemeMode,
  parseThemeMode,
  resolveTheme,
  setStoredThemeMode,
} from "../../../lib/dark-mode/theme";

describe("cycleThemeMode", () => {
  test("cycles through system, light, and dark", () => {
    expect(cycleThemeMode("system")).toBe("light");
    expect(cycleThemeMode("light")).toBe("dark");
    expect(cycleThemeMode("dark")).toBe("system");
  });
});

describe("parseThemeMode", () => {
  test("uses system for missing and invalid values", () => {
    expect(parseThemeMode(undefined)).toBe("system");
    expect(parseThemeMode("blue")).toBe("system");
  });

  test("accepts each supported mode", () => {
    expect(parseThemeMode("system")).toBe("system");
    expect(parseThemeMode("light")).toBe("light");
    expect(parseThemeMode("dark")).toBe("dark");
  });
});

describe("theme storage", () => {
  test("reads a saved mode", () => {
    const storage = createStorage({ theme: "dark" });

    expect(getStoredThemeMode(storage)).toBe("dark");
  });

  test("uses system for a missing or invalid saved mode", () => {
    expect(getStoredThemeMode(createStorage())).toBe("system");
    expect(getStoredThemeMode(createStorage({ theme: "blue" }))).toBe("system");
  });

  test("writes the selected mode", () => {
    const storage = createStorage();

    setStoredThemeMode({ mode: "light", storage });

    expect(storage.getItem("theme")).toBe("light");
  });
});

describe("resolveTheme", () => {
  test("resolves explicit modes without the system preference", () => {
    expect(resolveTheme("light", true)).toBe("light");
    expect(resolveTheme("dark", false)).toBe("dark");
  });

  test("resolves system mode from the system preference", () => {
    expect(resolveTheme("system", false)).toBe("light");
    expect(resolveTheme("system", true)).toBe("dark");
  });
});

function createStorage(values: Record<string, string> = {}) {
  const items = new Map(Object.entries(values));

  const storage = {
    getItem(key: string) {
      return items.get(key) ?? null;
    },
    setItem(key: string, value: string) {
      items.set(key, value);
    },
  };

  return storage;
}
