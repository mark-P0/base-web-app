"use client";

import type { HandlerError } from "@/lib/next-handlers/ErrorPage.client";
import { GlobalErrorPage } from "@/lib/next-handlers/GlobalErrorPage.client";

export default function GlobalError(props: {
  error: HandlerError;
  retry: () => void;
}) {
  return <GlobalErrorPage {...props} />;
}
