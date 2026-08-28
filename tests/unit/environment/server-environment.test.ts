import { describe, expect, test } from "bun:test";
import {
  parseServerEnvironment,
  resolveServerEnvironment,
} from "../../../lib/environment/server-environment";

const VALID_ENVIRONMENT = {
  BETTER_AUTH_SECRET: "12345678901234567890123456789012",
  BETTER_AUTH_URL: "https://example.com",
  MONGODB_DATABASE_NAME: "base_web_app",
  MONGODB_URI: "mongodb://localhost:27017/?replicaSet=rs0",
};

describe("parseServerEnvironment", () => {
  test("parses valid required values without Google credentials", () => {
    const environment = parseServerEnvironment({
      environment: VALID_ENVIRONMENT,
    });

    expect(environment).toEqual({
      betterAuthSecret: VALID_ENVIRONMENT.BETTER_AUTH_SECRET,
      betterAuthUrl: VALID_ENVIRONMENT.BETTER_AUTH_URL,
      googleCredentials: undefined,
      mongodbDatabaseName: VALID_ENVIRONMENT.MONGODB_DATABASE_NAME,
      mongodbUri: VALID_ENVIRONMENT.MONGODB_URI,
    });
  });

  test("parses a complete Google credential pair", () => {
    const environment = parseServerEnvironment({
      environment: {
        ...VALID_ENVIRONMENT,
        GOOGLE_CLIENT_ID: "google-client-id",
        GOOGLE_CLIENT_SECRET: "google-client-secret",
      },
    });

    expect(environment.googleCredentials).toEqual({
      clientId: "google-client-id",
      clientSecret: "google-client-secret",
    });
  });

  test.each([
    "BETTER_AUTH_SECRET",
    "BETTER_AUTH_URL",
    "MONGODB_DATABASE_NAME",
    "MONGODB_URI",
  ])("rejects a missing %s", (name) => {
    const environment = { ...VALID_ENVIRONMENT };

    Reflect.deleteProperty(environment, name);

    expect(() => parseServerEnvironment({ environment })).toThrow(
      `${name} is required.`,
    );
  });

  test("rejects a short Better Auth secret", () => {
    expect(() =>
      parseServerEnvironment({
        environment: {
          ...VALID_ENVIRONMENT,
          BETTER_AUTH_SECRET: "too-short",
        },
      }),
    ).toThrow("BETTER_AUTH_SECRET must contain at least 32 characters.");
  });

  test.each([
    "relative/path",
    "ftp://example.com",
  ])("rejects malformed Better Auth URL %s", (betterAuthUrl) => {
    expect(() =>
      parseServerEnvironment({
        environment: {
          ...VALID_ENVIRONMENT,
          BETTER_AUTH_URL: betterAuthUrl,
        },
      }),
    ).toThrow("BETTER_AUTH_URL must be a valid absolute HTTP(S) URL.");
  });

  test("rejects a malformed MongoDB URI", () => {
    expect(() =>
      parseServerEnvironment({
        environment: {
          ...VALID_ENVIRONMENT,
          MONGODB_URI: "https://example.com/database",
        },
      }),
    ).toThrow(
      "MONGODB_URI must start with mongodb:// or mongodb+srv:// and include a server.",
    );
  });

  test.each([
    ["GOOGLE_CLIENT_ID", "google-client-id"],
    ["GOOGLE_CLIENT_SECRET", "google-client-secret"],
  ])("rejects partial Google credentials with only %s", (name, value) => {
    expect(() =>
      parseServerEnvironment({
        environment: {
          ...VALID_ENVIRONMENT,
          [name]: value,
        },
      }),
    ).toThrow(
      "GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must both be set or both be absent.",
    );
  });
});

describe("resolveServerEnvironment", () => {
  test("uses safe placeholders for a CI production build", () => {
    const environment = resolveServerEnvironment({
      environment: {
        CI: "true",
        NEXT_PHASE: "phase-production-build",
      },
    });

    expect(environment.betterAuthSecret).toHaveLength(36);
    expect(environment.betterAuthUrl).toBe("http://localhost:3000");
    expect(environment.googleCredentials).toBeUndefined();
    expect(environment.mongodbDatabaseName).toBe("ci-build-placeholder");
    expect(environment.mongodbUri).toBe("mongodb://127.0.0.1:27017");
  });

  test("does not use placeholders outside a CI production build", () => {
    expect(() =>
      resolveServerEnvironment({
        environment: {
          CI: "true",
          NEXT_PHASE: "phase-production-server",
        },
      }),
    ).toThrow("BETTER_AUTH_SECRET is required.");
  });
});
