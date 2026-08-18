"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/lib/shadcn/button";
import {
  applyThemeToDocument,
  subscribeToSystemThemeChanges,
} from "./document";
import {
  cycleThemeMode,
  parseThemeMode,
  setStoredThemeMode,
  type ThemeMode,
} from "./theme";

function useThemeMode() {
  const [mode, setMode] = useState<ThemeMode | null>(null);
  const modeReference = useRef<ThemeMode>("system");

  useInitializeThemeMode({ modeReference, setMode });
  useApplySystemThemeChanges({ modeReference });

  function changeThemeMode(nextMode: ThemeMode) {
    try {
      setStoredThemeMode({ mode: nextMode, storage: window.localStorage });
    } catch {
      // The selected mode still applies for this page when storage is unavailable.
    }

    modeReference.current = nextMode;
    applyThemeToDocument({
      document,
      mode: nextMode,
      prefersDark: getSystemPrefersDark(),
    });
    setMode(nextMode);
  }

  return { changeThemeMode, mode };
}

function useInitializeThemeMode(args: {
  modeReference: { current: ThemeMode };
  setMode: (mode: ThemeMode) => void;
}) {
  const { modeReference, setMode } = args;

  useEffect(() => {
    const initializedMode = parseThemeMode(
      document.documentElement.dataset.theme,
    );

    modeReference.current = initializedMode;
    applyThemeToDocument({
      document,
      mode: initializedMode,
      prefersDark: getSystemPrefersDark(),
    });
    setMode(initializedMode);
  }, [modeReference, setMode]);
}

function useApplySystemThemeChanges(args: {
  modeReference: { current: ThemeMode };
}) {
  const { modeReference } = args;

  useEffect(() => {
    const mediaQueryList = window.matchMedia("(prefers-color-scheme: dark)");
    const unsubscribe = subscribeToSystemThemeChanges({
      getMode() {
        return modeReference.current;
      },
      mediaQueryList,
      onChange(prefersDark) {
        applyThemeToDocument({
          document,
          mode: modeReference.current,
          prefersDark,
        });
      },
    });

    return unsubscribe;
  }, [modeReference]);
}

function getSystemPrefersDark() {
  const mediaQueryList = window.matchMedia("(prefers-color-scheme: dark)");
  const prefersDark = mediaQueryList.matches;

  return prefersDark;
}

function getThemeModeLabel(mode: ThemeMode) {
  if (mode === "system") {
    return "System";
  }

  if (mode === "light") {
    return "Light";
  }

  return "Dark";
}

function ThemeModeIcon(props: { mode: ThemeMode }) {
  const { mode } = props;

  if (mode === "system") {
    return <Monitor aria-hidden="true" />;
  }

  if (mode === "light") {
    return <Sun aria-hidden="true" />;
  }

  if (mode === "dark") {
    return <Moon aria-hidden="true" />;
  }

  return null;
}

export function ThemeToggle() {
  const { changeThemeMode, mode } = useThemeMode();
  const [statusMessage, setStatusMessage] = useState("");

  if (!mode) {
    return null;
  }

  const nextMode = cycleThemeMode(mode);
  const currentModeLabel = getThemeModeLabel(mode);
  const nextModeLabel = getThemeModeLabel(nextMode);
  const accessibleName = `Theme mode is ${currentModeLabel}. Activate to switch to ${nextModeLabel}.`;

  function handleClick() {
    changeThemeMode(nextMode);
    setStatusMessage(`Theme mode changed to ${nextModeLabel}.`);
  }

  return (
    <>
      <Button
        aria-label={accessibleName}
        className="fixed right-[max(1rem,env(safe-area-inset-right))] bottom-[max(1rem,env(safe-area-inset-bottom))] z-50 size-11 touch-manipulation rounded-full shadow-lg md:right-[max(1.5rem,env(safe-area-inset-right))] md:bottom-[max(1.5rem,env(safe-area-inset-bottom))]"
        onClick={handleClick}
        size="icon"
        type="button"
        variant="outline"
      >
        <ThemeModeIcon mode={mode} />
      </Button>
      <span aria-live="polite" className="sr-only">
        {statusMessage}
      </span>
    </>
  );
}
