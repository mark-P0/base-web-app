"use client";

import { useState } from "react";
import { Button } from "@/lib/shadcn/button";

export function ClientRenderErrorTrigger(props: { previewName: string }) {
  const { previewName } = props;
  const [isErrorActive, setIsErrorActive] = useState(false);

  function activateError() {
    setIsErrorActive(true);
  }

  if (isErrorActive) {
    throw new Error(`${previewName} preview error`);
  }

  return (
    <Button onClick={activateError} type="button">
      Trigger {previewName} error
    </Button>
  );
}
