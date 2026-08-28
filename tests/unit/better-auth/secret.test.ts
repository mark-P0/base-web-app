import { expect, test } from "bun:test";
import { generateBetterAuthSecret } from "../../../lib/better-auth/secret";

const BASE64URL_PATTERN = /^[A-Za-z0-9_-]+$/;
const BETTER_AUTH_SECRET_BYTE_LENGTH = 32;
const BETTER_AUTH_SECRET_CHARACTER_LENGTH = 43;

test("generates a 256-bit base64url secret", () => {
  const secret = generateBetterAuthSecret();
  const decodedSecret = Buffer.from(secret, "base64url");

  expect(secret).toHaveLength(BETTER_AUTH_SECRET_CHARACTER_LENGTH);
  expect(secret).toMatch(BASE64URL_PATTERN);
  expect(decodedSecret).toHaveLength(BETTER_AUTH_SECRET_BYTE_LENGTH);
});

test("generates independent secret values", () => {
  const sampleCount = 32;
  const secrets = new Set(
    Array.from({ length: sampleCount }, () => generateBetterAuthSecret()),
  );

  expect(secrets).toHaveLength(sampleCount);
});
