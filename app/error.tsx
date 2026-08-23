"use client";

import {
  ErrorPage,
  type HandlerError,
} from "@/lib/next-handlers/ErrorPage.client";

export default function ApplicationError(props: {
  error: HandlerError;
  retry: () => void;
}) {
  return <ErrorPage {...props} />;
}
