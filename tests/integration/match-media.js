let defaultMatchMedia;

/**
 * Install a deterministic `matchMedia` implementation for an integration test.
 *
 * Call `setMatches()` to change the operating-system preference and notify each
 * media query list that the test created. Call `restore()` when the test needs
 * to restore the default implementation before shared cleanup runs.
 */
export function installMatchMedia(args = {}) {
  let matches = args.matches ?? false;
  const mediaQueryLists = new Set();

  if (!defaultMatchMedia) {
    defaultMatchMedia = window.matchMedia;
  }

  function matchMedia(query) {
    const mediaQueryList = createMediaQueryList({ matches, query });

    mediaQueryLists.add(mediaQueryList);

    return mediaQueryList.value;
  }

  window.matchMedia = matchMedia;

  function setMatches(nextMatches) {
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

function createMediaQueryList(args) {
  const { matches, query } = args;
  const listeners = new Set();
  let currentMatches = matches;

  const value = {
    media: query,
    onchange: null,
    get matches() {
      return currentMatches;
    },
    addEventListener(type, listener) {
      if (type === "change" && listener) {
        listeners.add(listener);
      }
    },
    removeEventListener(type, listener) {
      if (type === "change" && listener) {
        listeners.delete(listener);
      }
    },
    addListener(listener) {
      if (listener) {
        listeners.add(listener);
      }
    },
    removeListener(listener) {
      if (listener) {
        listeners.delete(listener);
      }
    },
    dispatchEvent() {
      return true;
    },
  };

  function notify(nextMatches) {
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
