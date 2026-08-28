import { randomBytes } from "node:crypto";

const BETTER_AUTH_SECRET_BYTE_LENGTH = 32;

/**
 * Generates a Better Auth secret with 256 bits of cryptographic randomness.
 *
 * The returned value uses URL-safe base64 without padding. Store it in the
 * `BETTER_AUTH_SECRET` environment variable. Treat the value as a credential:
 * do not commit it, log it in shared systems, or expose it to browser code.
 */
export function generateBetterAuthSecret() {
  const secret = randomBytes(BETTER_AUTH_SECRET_BYTE_LENGTH).toString(
    "base64url",
  );

  return secret;
}

if (import.meta.main) {
  const secret = generateBetterAuthSecret();

  console.log(secret);
}
