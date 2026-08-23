"use client";

import { usePathname } from "next/navigation";
import { ClientRenderErrorTrigger } from "./ClientRenderErrorTrigger.client";
import { isGlobalErrorPreviewPath } from "./global-error-preview";

function useIsGlobalErrorPreview() {
  const pathname = usePathname();
  const isGlobalErrorPreview = isGlobalErrorPreviewPath({ pathname });

  return isGlobalErrorPreview;
}

export function GlobalErrorPreviewTrigger() {
  const isGlobalErrorPreview = useIsGlobalErrorPreview();

  if (!isGlobalErrorPreview) {
    return null;
  }

  return <ClientRenderErrorTrigger previewName="global" />;
}
