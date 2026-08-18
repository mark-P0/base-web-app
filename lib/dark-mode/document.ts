import {
  type EffectiveTheme,
  resolveTheme,
  THEME_CHANGE_EVENT,
  type ThemeMode,
} from "./theme";

export type ThemeChange = {
  effectiveTheme: EffectiveTheme;
  mode: ThemeMode;
};

export function applyThemeToDocument(args: {
  document: Document;
  mode: ThemeMode;
  prefersDark: boolean;
}) {
  const { document, mode, prefersDark } = args;
  const effectiveTheme = resolveTheme(mode, prefersDark);
  const root = document.documentElement;

  root.dataset.theme = mode;
  root.classList.toggle("dark", effectiveTheme === "dark");

  const change: ThemeChange = { effectiveTheme, mode };
  const event = new CustomEvent<ThemeChange>(THEME_CHANGE_EVENT, {
    detail: change,
  });

  document.dispatchEvent(event);

  return change;
}

export function subscribeToThemeChanges(args: {
  callback: (change: ThemeChange) => void;
  document: Document;
}) {
  const { callback, document } = args;

  function handleThemeChange(event: Event) {
    const changeEvent = event as CustomEvent<ThemeChange>;

    callback(changeEvent.detail);
  }

  document.addEventListener(THEME_CHANGE_EVENT, handleThemeChange);

  function unsubscribe() {
    document.removeEventListener(THEME_CHANGE_EVENT, handleThemeChange);
  }

  return unsubscribe;
}

export function subscribeToSystemThemeChanges(args: {
  getMode: () => ThemeMode;
  mediaQueryList: MediaQueryList;
  onChange: (prefersDark: boolean) => void;
}) {
  const { getMode, mediaQueryList, onChange } = args;

  function handleChange(event: MediaQueryListEvent) {
    if (getMode() !== "system") {
      return;
    }

    onChange(event.matches);
  }

  mediaQueryList.addEventListener("change", handleChange);

  function unsubscribe() {
    mediaQueryList.removeEventListener("change", handleChange);
  }

  return unsubscribe;
}
