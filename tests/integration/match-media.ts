type MediaQueryChangeListener =
  | ((event: MediaQueryListEvent) => void)
  | EventListenerObject;

let defaultMatchMedia: typeof window.matchMedia | undefined;

/**
 * Install a deterministic `matchMedia` implementation for an integration test.
 *
 * Call `setMatches()` to change the operating-system preference and notify each
 * media query list that the test created. Call `restore()` when the test needs
 * to restore the default implementation before shared cleanup runs.
 */
export function installMatchMedia(args: { matches?: boolean } = {}) {
  let matches = args.matches ?? false;
  const mediaQueryLists = new Set<ReturnType<typeof createMediaQueryList>>();

  if (!defaultMatchMedia) {
    defaultMatchMedia = window.matchMedia;
  }

  function matchMedia(query: string) {
    const mediaQueryList = createMediaQueryList({ matches, query });

    mediaQueryLists.add(mediaQueryList);

    return mediaQueryList.value;
  }

  window.matchMedia = matchMedia;

  function setMatches(nextMatches: boolean) {
    matches = nextMatches;

    for (const mediaQueryList of mediaQueryLists) {
      mediaQueryList.notify(nextMatches);
    }
  }

  function restore() {
    resetMatchMedia();
  }

  return { restore, setMatches };
}

/**
 * Restore Happy DOM's default `matchMedia` implementation.
 *
 * The shared integration-test cleanup calls this after every test.
 */
export function resetMatchMedia() {
  if (!defaultMatchMedia) {
    return;
  }

  window.matchMedia = defaultMatchMedia;
}

function createMediaQueryList(args: { matches: boolean; query: string }) {
  const { matches, query } = args;
  const listeners = new Set<MediaQueryChangeListener>();
  let currentMatches = matches;
  const initialOnChange: MediaQueryList["onchange"] = null;

  const partialMediaQueryList = {
    media: query,
    onchange: initialOnChange,
    get matches() {
      return currentMatches;
    },
    addEventListener(type: string, listener: MediaQueryChangeListener | null) {
      if (type === "change" && listener) {
        listeners.add(listener);
      }
    },
    removeEventListener(
      type: string,
      listener: MediaQueryChangeListener | null,
    ) {
      if (type === "change" && listener) {
        listeners.delete(listener);
      }
    },
    addListener(listener: MediaQueryChangeListener | null) {
      if (listener) {
        listeners.add(listener);
      }
    },
    removeListener(listener: MediaQueryChangeListener | null) {
      if (listener) {
        listeners.delete(listener);
      }
    },
    dispatchEvent() {
      return true;
    },
  };

  // The test double implements the MediaQueryList members used by the tests.
  const value = partialMediaQueryList as MediaQueryList;

  function notify(nextMatches: boolean) {
    currentMatches = nextMatches;

    const event = new MediaQueryListEvent("change", {
      matches: nextMatches,
      media: query,
    });

    for (const listener of listeners) {
      if (typeof listener === "function") {
        listener.call(value, event);
        continue;
      }

      listener.handleEvent(event);
    }

    value.onchange?.call(value, event);
  }

  return { notify, value };
}
