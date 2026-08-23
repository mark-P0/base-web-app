"use client";

import "@/lib/styles/tailwind.css";
import { useLayoutEffect } from "react";
import { applyThemeToDocument } from "@/lib/dark-mode/document";
import { getStoredThemeMode } from "@/lib/dark-mode/theme";
import { cn } from "@/lib/shadcn/utils";
import { geistMono, geistSans } from "@/lib/styles/fonts";
import { ErrorPage, type HandlerError } from "./ErrorPage.client";

// React does not execute scripts rendered by Client Components.
function useInitializeGlobalErrorTheme() {
  useLayoutEffect(() => {
    try {
      const mode = getStoredThemeMode(window.localStorage);
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;

      applyThemeToDocument({ document, mode, prefersDark });
    } catch {
      // Keep the default light theme when browser APIs are unavailable.
    }
  }, []);
}

export function GlobalErrorPage(props: {
  error: HandlerError;
  retry: () => void;
}) {
  const { error, retry } = props;

  useInitializeGlobalErrorTheme();

  return (
    <html
      lang="en"
      className={cn(geistSans.variable, geistMono.variable)}
      suppressHydrationWarning
    >
      {/* biome-ignore lint/style/noHeadElement: Global error pages must provide a complete HTML document. */}
      <head>
        <title>Application error</title>
      </head>
      <body>
        <ErrorPage error={error} retry={retry} />
      </body>
    </html>
  );
}
