"use client";

import { ErrorPage, type HandlerError } from "./ErrorPage.client";
import "./global-error.css";

export function GlobalErrorPage(props: {
  error: HandlerError;
  retry: () => void;
}) {
  const { error, retry } = props;

  return (
    <html lang="en" suppressHydrationWarning>
      {/* biome-ignore lint/style/noHeadElement: Global error pages must provide a complete HTML document. */}
      <head>
        <title>Application error</title>
        <script src="/dark-mode-init.js" />
      </head>
      <body>
        <ErrorPage error={error} retry={retry} />
      </body>
    </html>
  );
}
