import { ClientRenderErrorTrigger } from "@/lib/next-handlers/ClientRenderErrorTrigger.client";
import { DevelopmentPreviewPage } from "@/lib/next-handlers/DevelopmentPreviewPage";

export default function ErrorPreviewRoute() {
  return (
    <DevelopmentPreviewPage
      actions={<ClientRenderErrorTrigger previewName="application" />}
      description="Activate this control to throw during client rendering. Select Try again to remount the trigger in its inactive state."
      title="Application error preview"
    />
  );
}
