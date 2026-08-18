import { describe, expect, test } from "bun:test";

import {
  applyThemeToDocument,
  subscribeToSystemThemeChanges,
  subscribeToThemeChanges,
} from "../../../lib/dark-mode/document";

describe("applyThemeToDocument", () => {
  test("updates the root and notifies subscribers", () => {
    const fakeDocument = createFakeDocument();
    const changes = [];
    const unsubscribe = subscribeToThemeChanges({
      callback(change) {
        changes.push(change);
      },
      document: fakeDocument,
    });

    const change = applyThemeToDocument({
      document: fakeDocument,
      mode: "system",
      prefersDark: true,
    });

    expect(fakeDocument.documentElement.dataset.theme).toBe("system");
    expect(fakeDocument.documentElement.classList.contains("dark")).toBe(true);
    expect(change).toEqual({ effectiveTheme: "dark", mode: "system" });
    expect(changes).toEqual([change]);

    unsubscribe();
    applyThemeToDocument({
      document: fakeDocument,
      mode: "light",
      prefersDark: true,
    });

    expect(fakeDocument.documentElement.classList.contains("dark")).toBe(false);
    expect(changes).toEqual([change]);
  });
});

describe("subscribeToSystemThemeChanges", () => {
  test("notifies system mode only and removes its listener", () => {
    let mode = "system";
    let listener;
    const changes = [];
    const mediaQueryList = {
      addEventListener(type, callback) {
        if (type === "change") {
          listener = callback;
        }
      },
      removeEventListener(type, callback) {
        if (type === "change" && listener === callback) {
          listener = undefined;
        }
      },
    };
    const unsubscribe = subscribeToSystemThemeChanges({
      getMode() {
        return mode;
      },
      mediaQueryList,
      onChange(prefersDark) {
        changes.push(prefersDark);
      },
    });

    listener({ matches: true });
    mode = "dark";
    listener({ matches: false });
    unsubscribe();

    expect(changes).toEqual([true]);
    expect(listener).toBeUndefined();
  });
});

function createFakeDocument() {
  const listeners = new Map();
  const classNames = new Set();
  const documentElement = {
    classList: {
      contains(className) {
        return classNames.has(className);
      },
      toggle(className, force) {
        if (force) {
          classNames.add(className);
          return true;
        }

        classNames.delete(className);
        return false;
      },
    },
    dataset: {},
  };

  return {
    addEventListener(type, callback) {
      const callbacks = listeners.get(type) ?? new Set();

      callbacks.add(callback);
      listeners.set(type, callbacks);
    },
    dispatchEvent(event) {
      const callbacks = listeners.get(event.type) ?? new Set();

      for (const callback of callbacks) {
        callback(event);
      }

      return true;
    },
    documentElement,
    removeEventListener(type, callback) {
      const callbacks = listeners.get(type);

      if (callbacks) {
        callbacks.delete(callback);
      }
    },
  };
}
