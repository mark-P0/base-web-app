export const LOADING_PREVIEW_PATH = "/dev/next-handlers/loading";
export const LOADING_PREVIEW_DELAY_MS = 2_000;

export function waitForLoadingPreview() {
  const delay = new Promise<void>((resolve) => {
    setTimeout(resolve, LOADING_PREVIEW_DELAY_MS);
  });

  return delay;
}
