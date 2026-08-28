import "server-only";
import { resolveServerEnvironment } from "./server-environment";

export const serverEnvironment = resolveServerEnvironment({
  environment: process.env,
});
