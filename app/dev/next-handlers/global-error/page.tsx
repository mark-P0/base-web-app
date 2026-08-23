import type { Metadata } from "next";
import { DevelopmentPreviewPage } from "@/lib/next-handlers/DevelopmentPreviewPage";

export const metadata: Metadata = {
  title: "Global Error Preview",
};

export default function GlobalErrorPreviewRoute() {
  return (
    <DevelopmentPreviewPage
      description="The root layout renders the Trigger global error control after this page. This route does not render the control because the error must occur in the root layout for global-error.tsx to handle it. Select Try again to remount the trigger in its inactive state."
      title="Global error preview"
    />
  );
}
