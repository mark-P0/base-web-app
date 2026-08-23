export const GLOBAL_ERROR_PREVIEW_PATH = "/dev/next-handlers/global-error";

export function isGlobalErrorPreviewPath(args: { pathname: string }) {
  const { pathname } = args;
  const isGlobalErrorPreview = pathname === GLOBAL_ERROR_PREVIEW_PATH;

  return isGlobalErrorPreview;
}
