export type ThemeMode = "system" | "light" | "dark";
export type EffectiveTheme = "light" | "dark";

export const THEME_STORAGE_KEY = "theme";
export const THEME_CHANGE_EVENT = "dark-mode-change";

const themeModes: readonly ThemeMode[] = ["system", "light", "dark"];

export function isThemeMode(value: string | undefined): value is ThemeMode {
  const isSupportedThemeMode = themeModes.some(
    (themeMode) => themeMode === value,
  );

  return isSupportedThemeMode;
}

export function parseThemeMode(value: string | undefined) {
  if (isThemeMode(value)) {
    return value;
  }

  return "system";
}

export function cycleThemeMode(mode: ThemeMode) {
  const currentIndex = themeModes.indexOf(mode);
  const nextIndex = (currentIndex + 1) % themeModes.length;
  const nextMode = themeModes[nextIndex];

  return nextMode;
}

export function resolveTheme(mode: ThemeMode, prefersDark: boolean) {
  if (mode === "system") {
    if (prefersDark) {
      return "dark";
    }

    return "light";
  }

  return mode;
}

export function getStoredThemeMode(storage: Pick<Storage, "getItem">) {
  const value = storage.getItem(THEME_STORAGE_KEY) ?? undefined;
  const mode = parseThemeMode(value);

  return mode;
}

export function setStoredThemeMode(args: {
  mode: ThemeMode;
  storage: Pick<Storage, "setItem">;
}) {
  const { mode, storage } = args;

  storage.setItem(THEME_STORAGE_KEY, mode);
}
