import { describe, expect, test } from "bun:test";
import type { ThemeChange } from "../../../lib/dark-mode/document";
import {
  applyThemeToDocument,
  subscribeToSystemThemeChanges,
  subscribeToThemeChanges,
} from "../../../lib/dark-mode/document";
import type { ThemeMode } from "../../../lib/dark-mode/theme";

describe("applyThemeToDocument", () => {
  test("updates the root and notifies subscribers", () => {
    const fakeDocument = createFakeDocument();
    const changes: ThemeChange[] = [];
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
    let mode: ThemeMode = "system";
    let listener: ((event: MediaQueryListEvent) => void) | undefined;
    const changes: boolean[] = [];
    const mediaQueryList = {
      addEventListener(
        type: string,
        callback: (event: MediaQueryListEvent) => void,
      ) {
        if (type === "change") {
          listener = callback;
        }
      },
      removeEventListener(
        type: string,
        callback: (event: MediaQueryListEvent) => void,
      ) {
        if (type === "change" && listener === callback) {
          listener = undefined;
        }
      },
    } as MediaQueryList;
    const unsubscribe = subscribeToSystemThemeChanges({
      getMode() {
        return mode;
      },
      mediaQueryList,
      onChange(prefersDark) {
        changes.push(prefersDark);
      },
    });

    listener?.({ matches: true } as MediaQueryListEvent);
    mode = "dark";
    listener?.({ matches: false } as MediaQueryListEvent);
    unsubscribe();

    expect(changes).toEqual([true]);
    expect(listener).toBeUndefined();
  });
});

function createFakeDocument() {
  const listeners = new Map<string, Set<EventListener>>();
  const classNames = new Set<string>();
  const documentElement = {
    classList: {
      contains(className: string) {
        return classNames.has(className);
      },
      toggle(className: string, force?: boolean) {
        if (force) {
          classNames.add(className);
          return true;
        }

        classNames.delete(className);
        return false;
      },
    },
    dataset: {} as DOMStringMap,
  };

  return {
    addEventListener(type: string, callback: EventListener) {
      const callbacks = listeners.get(type) ?? new Set();

      callbacks.add(callback);
      listeners.set(type, callbacks);
    },
    dispatchEvent(event: Event) {
      const callbacks = listeners.get(event.type) ?? new Set();

      for (const callback of callbacks) {
        callback(event);
      }

      return true;
    },
    documentElement,
    removeEventListener(type: string, callback: EventListener) {
      const callbacks = listeners.get(type);

      if (callbacks) {
        callbacks.delete(callback);
      }
    },
  } as unknown as Document;
}
