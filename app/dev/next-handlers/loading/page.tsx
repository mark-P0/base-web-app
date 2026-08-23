import { connection } from "next/server";
import { LoadingPreviewPage } from "@/lib/next-handlers/LoadingPreviewPage";
import { waitForLoadingPreview } from "@/lib/next-handlers/loading-preview";

export default async function LoadingPreviewRoute() {
  await connection();
  await waitForLoadingPreview();

  return <LoadingPreviewPage />;
}
