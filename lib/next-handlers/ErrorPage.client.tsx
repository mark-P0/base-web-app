"use client";

import { Button } from "@/lib/shadcn/button";
import { StatusPage } from "./StatusPage";

export type HandlerError = Error & {
  digest?: string;
};

export function ErrorPage(props: { error: HandlerError; retry: () => void }) {
  const { error, retry } = props;
  const digest = error.digest;

  function handleRetry() {
    retry();
  }

  return (
    <StatusPage
      actions={
        <Button onClick={handleRetry} type="button">
          Try again
        </Button>
      }
      code="Application error"
      description="An unexpected error stopped this page from loading. You can try again or return to the home page."
      title="Something went wrong"
    >
      {Boolean(digest) && (
        <p className="rounded-md bg-muted px-3 py-2 font-mono text-xs text-muted-foreground">
          Error reference: {digest}
        </p>
      )}
    </StatusPage>
  );
}
