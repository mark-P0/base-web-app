import { expect, test } from "bun:test";
import {
  GLOBAL_ERROR_PREVIEW_PATH,
  isGlobalErrorPreviewPath,
} from "../../../lib/next-handlers/global-error-preview";

test("activates the global error trigger only for its exact preview route", () => {
  expect(
    isGlobalErrorPreviewPath({ pathname: GLOBAL_ERROR_PREVIEW_PATH }),
  ).toBe(true);
  expect(
    isGlobalErrorPreviewPath({ pathname: "/dev/next-handlers/error" }),
  ).toBe(false);
  expect(
    isGlobalErrorPreviewPath({
      pathname: "/dev/next-handlers/global-error/details",
    }),
  ).toBe(false);
});
