"use client";

import { useEffect, useState } from "react";
import { Button } from "@/lib/shadcn/button";
import { Input } from "@/lib/shadcn/input";
import { Label } from "@/lib/shadcn/label";
import { Textarea } from "@/lib/shadcn/textarea";
import { subscribeToThemeChanges, type ThemeChange } from "./document";
import {
  type EffectiveTheme,
  parseThemeMode,
  THEME_STORAGE_KEY,
  type ThemeMode,
} from "./theme";

type ThemeDiagnostics = {
  effectiveTheme: EffectiveTheme;
  mode: ThemeMode;
  prefersDark: boolean;
  rawStorageValue: string;
};

const tokenSwatches = [
  ["Background", "bg-background", "text-foreground"],
  ["Foreground", "bg-foreground", "text-background"],
  ["Primary", "bg-primary", "text-primary-foreground"],
  ["Secondary", "bg-secondary", "text-secondary-foreground"],
  ["Muted", "bg-muted", "text-muted-foreground"],
  ["Accent", "bg-accent", "text-accent-foreground"],
  ["Destructive", "bg-destructive", "text-white"],
  ["Border", "bg-border", "text-foreground"],
  ["Input", "bg-input", "text-foreground"],
  ["Ring", "bg-ring", "text-background"],
] as const;

function useThemeDiagnostics() {
  const [diagnostics, setDiagnostics] = useState<ThemeDiagnostics | null>(null);

  useEffect(() => {
    const mediaQueryList = window.matchMedia("(prefers-color-scheme: dark)");

    function refreshDiagnostics(change?: ThemeChange) {
      const mode =
        change?.mode ?? parseThemeMode(document.documentElement.dataset.theme);
      const effectiveTheme = change?.effectiveTheme ?? getEffectiveTheme();
      const nextDiagnostics = {
        effectiveTheme,
        mode,
        prefersDark: mediaQueryList.matches,
        rawStorageValue: getRawStorageValue(),
      };

      setDiagnostics(nextDiagnostics);
    }

    refreshDiagnostics();

    const unsubscribeThemeChanges = subscribeToThemeChanges({
      callback(change) {
        refreshDiagnostics(change);
      },
      document,
    });
    function handleSystemPreferenceChange() {
      refreshDiagnostics();
    }

    mediaQueryList.addEventListener("change", handleSystemPreferenceChange);

    return () => {
      unsubscribeThemeChanges();
      mediaQueryList.removeEventListener(
        "change",
        handleSystemPreferenceChange,
      );
    };
  }, []);

  return diagnostics;
}

function getEffectiveTheme() {
  if (document.documentElement.classList.contains("dark")) {
    return "dark";
  }

  return "light";
}

function getRawStorageValue() {
  try {
    const value = window.localStorage.getItem(THEME_STORAGE_KEY);

    if (value) {
      return value;
    }

    const missingValue = "(missing)";

    return missingValue;
  } catch {
    const unavailableValue = "(unavailable)";

    return unavailableValue;
  }
}

function getModeDescription(mode: ThemeMode) {
  if (mode === "system") {
    return "Follows the operating-system preference.";
  }

  if (mode === "light") {
    return "Forces the light theme.";
  }

  return "Forces the dark theme.";
}

function getOperatingSystemLabel(prefersDark: boolean | undefined) {
  if (prefersDark) {
    return "Dark";
  }

  return "Light";
}

function DiagnosticValue(props: { label: string; value: string }) {
  const { label, value } = props;

  return (
    <div className="rounded-lg border bg-background p-4 shadow-xs">
      <dt className="font-mono text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </dt>
      <dd className="mt-2 break-words font-medium">{value}</dd>
    </div>
  );
}

export function DarkModeDevelopmentPage() {
  const diagnostics = useThemeDiagnostics();
  const selectedMode = diagnostics?.mode ?? "system";
  const operatingSystemLabel = getOperatingSystemLabel(
    diagnostics?.prefersDark,
  );

  return (
    <main className="min-h-screen bg-muted/30 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="space-y-3 border-b pb-8">
          <p className="font-mono text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
            Development / Theme
          </p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Dark mode diagnostics
          </h1>
          <p className="max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
            Check theme state and contrast. Use the floating theme button in the
            lower-right corner to cycle through the modes.
          </p>
        </header>

        <section aria-labelledby="theme-state-heading" className="space-y-4">
          <div>
            <h2 id="theme-state-heading" className="text-lg font-semibold">
              Live state
            </h2>
            <p className="text-sm text-muted-foreground">
              {getModeDescription(selectedMode)}
            </p>
          </div>
          <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <DiagnosticValue label="Selected mode" value={selectedMode} />
            <DiagnosticValue
              label="Effective theme"
              value={diagnostics?.effectiveTheme ?? "Loading"}
            />
            <DiagnosticValue
              label="Operating system"
              value={operatingSystemLabel}
            />
            <DiagnosticValue
              label="localStorage theme"
              value={diagnostics?.rawStorageValue ?? "Loading"}
            />
          </dl>
        </section>

        <section aria-labelledby="token-heading" className="space-y-4">
          <div>
            <h2 id="token-heading" className="text-lg font-semibold">
              Theme tokens
            </h2>
            <p className="text-sm text-muted-foreground">
              Each sample uses the active CSS token.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {tokenSwatches.map(([name, backgroundClassName, textClassName]) => (
              <div
                key={name}
                className={`min-h-24 rounded-lg border p-4 shadow-xs ${backgroundClassName} ${textClassName}`}
              >
                <p className="font-medium">{name}</p>
                <p className="mt-1 text-xs opacity-80">Token sample</p>
              </div>
            ))}
          </div>
        </section>

        <section
          aria-labelledby="contrast-heading"
          className="grid gap-6 lg:grid-cols-2"
        >
          <div className="rounded-xl border bg-background p-5 shadow-xs sm:p-6">
            <h2 id="contrast-heading" className="text-lg font-semibold">
              Content and actions
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Check text hierarchy, surfaces, and button states.
            </p>
            <article className="mt-6 rounded-lg border bg-background p-5">
              <p className="text-sm font-medium text-primary">Release note</p>
              <h3 className="mt-2 text-xl font-semibold">Theme token review</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Verify readable text on every surface before a release.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Button type="button">Primary action</Button>
                <Button type="button" variant="secondary">
                  Secondary action
                </Button>
                <Button type="button" variant="outline">
                  Outline action
                </Button>
                <Button type="button" variant="destructive">
                  Destructive action
                </Button>
              </div>
            </article>
          </div>

          <form className="rounded-xl border bg-background p-5 shadow-xs sm:p-6">
            <h2 className="text-lg font-semibold">Form controls</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Check input surfaces, focus rings, and validation text.
            </p>
            <div className="mt-6 space-y-5">
              <div className="space-y-2">
                <Label htmlFor="dark-mode-name">Display name</Label>
                <Input id="dark-mode-name" placeholder="Ada Lovelace" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dark-mode-email">Email</Label>
                <Input
                  id="dark-mode-email"
                  aria-describedby="dark-mode-email-error"
                  aria-invalid="true"
                  defaultValue="not-an-email"
                  type="email"
                />
                <p
                  id="dark-mode-email-error"
                  className="text-xs text-destructive"
                >
                  Enter a valid email address.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dark-mode-notes">Notes</Label>
                <Textarea
                  id="dark-mode-notes"
                  placeholder="Add review notes."
                />
              </div>
              <Button className="w-full" type="button">
                Save example
              </Button>
            </div>
          </form>
        </section>

        <section className="rounded-xl border bg-background p-5 shadow-xs sm:p-6">
          <h2 className="text-lg font-semibold">Test instructions</h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-6 text-muted-foreground">
            <li>Use the floating button in the lower-right corner.</li>
            <li>
              Confirm the state values update for system, light, and dark.
            </li>
            <li>
              Change the operating-system preference while system is selected.
            </li>
            <li>
              Check token swatches, controls, focus rings, and text contrast.
            </li>
          </ol>
        </section>
      </div>
    </main>
  );
}
