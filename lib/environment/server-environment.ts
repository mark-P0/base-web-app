export type GoogleCredentials = {
  clientId: string;
  clientSecret: string;
};

export type ServerEnvironment = {
  betterAuthSecret: string;
  betterAuthUrl: string;
  googleCredentials?: GoogleCredentials;
  mongodbDatabaseName: string;
  mongodbUri: string;
};

type EnvironmentInput = Record<string, string | undefined>;

const BETTER_AUTH_SECRET_MINIMUM_LENGTH = 32;
const CI_BUILD_ENVIRONMENT = {
  BETTER_AUTH_SECRET: "ci-build-placeholder-not-for-runtime",
  BETTER_AUTH_URL: "http://localhost:3000",
  MONGODB_DATABASE_NAME: "ci-build-placeholder",
  MONGODB_URI: "mongodb://127.0.0.1:27017",
} satisfies EnvironmentInput;
const NEXT_PRODUCTION_BUILD_PHASE = "phase-production-build";

function parseOptionalValue(args: {
  environment: EnvironmentInput;
  name: string;
  trim?: boolean;
}) {
  const { environment, name, trim = true } = args;
  const value = environment[name];

  if (!value?.trim()) {
    return undefined;
  }

  if (trim) {
    return value.trim();
  }

  return value;
}

function parseRequiredValue(args: {
  environment: EnvironmentInput;
  name: string;
  trim?: boolean;
}) {
  const { environment, name, trim = true } = args;
  const value = parseOptionalValue({ environment, name, trim });

  if (!value) {
    throw new Error(`${name} is required.`);
  }

  return value;
}

function parseBetterAuthSecret(args: { environment: EnvironmentInput }) {
  const { environment } = args;
  const betterAuthSecret = parseRequiredValue({
    environment,
    name: "BETTER_AUTH_SECRET",
    trim: false,
  });

  if (betterAuthSecret.length < BETTER_AUTH_SECRET_MINIMUM_LENGTH) {
    throw new Error(
      `BETTER_AUTH_SECRET must contain at least ${BETTER_AUTH_SECRET_MINIMUM_LENGTH} characters.`,
    );
  }

  return betterAuthSecret;
}

function parseBetterAuthUrl(args: { environment: EnvironmentInput }) {
  const { environment } = args;
  const betterAuthUrl = parseRequiredValue({
    environment,
    name: "BETTER_AUTH_URL",
  });
  let parsedUrl: URL;

  try {
    parsedUrl = new URL(betterAuthUrl);
  } catch {
    throw new Error("BETTER_AUTH_URL must be a valid absolute HTTP(S) URL.");
  }

  if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
    throw new Error("BETTER_AUTH_URL must be a valid absolute HTTP(S) URL.");
  }

  return betterAuthUrl;
}

function parseGoogleCredentials(args: { environment: EnvironmentInput }) {
  const { environment } = args;
  const clientId = parseOptionalValue({
    environment,
    name: "GOOGLE_CLIENT_ID",
  });
  const clientSecret = parseOptionalValue({
    environment,
    name: "GOOGLE_CLIENT_SECRET",
    trim: false,
  });

  if (!clientId && !clientSecret) {
    return undefined;
  }

  if (!clientId || !clientSecret) {
    throw new Error(
      "GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must both be set or both be absent.",
    );
  }

  const googleCredentials: GoogleCredentials = {
    clientId,
    clientSecret,
  };

  return googleCredentials;
}

function parseMongoDbUri(args: { environment: EnvironmentInput }) {
  const { environment } = args;
  const mongodbUri = parseRequiredValue({
    environment,
    name: "MONGODB_URI",
  });

  if (!/^mongodb(?:\+srv)?:\/\/.+/.test(mongodbUri)) {
    throw new Error(
      "MONGODB_URI must start with mongodb:// or mongodb+srv:// and include a server.",
    );
  }

  return mongodbUri;
}

export function parseServerEnvironment(args: {
  environment: EnvironmentInput;
}) {
  const { environment } = args;
  const betterAuthSecret = parseBetterAuthSecret({ environment });
  const betterAuthUrl = parseBetterAuthUrl({ environment });
  const googleCredentials = parseGoogleCredentials({ environment });
  const mongodbDatabaseName = parseRequiredValue({
    environment,
    name: "MONGODB_DATABASE_NAME",
  });
  const mongodbUri = parseMongoDbUri({ environment });
  const serverEnvironment: ServerEnvironment = {
    betterAuthSecret,
    betterAuthUrl,
    googleCredentials,
    mongodbDatabaseName,
    mongodbUri,
  };

  return serverEnvironment;
}

export function resolveServerEnvironment(args: {
  environment: EnvironmentInput;
}) {
  const { environment } = args;
  const isCiBuild =
    environment.CI === "true" &&
    environment.NEXT_PHASE === NEXT_PRODUCTION_BUILD_PHASE;

  if (!isCiBuild) {
    const serverEnvironment = parseServerEnvironment({ environment });

    return serverEnvironment;
  }

  const ciBuildEnvironment: EnvironmentInput = {
    ...environment,
    BETTER_AUTH_SECRET:
      environment.BETTER_AUTH_SECRET ?? CI_BUILD_ENVIRONMENT.BETTER_AUTH_SECRET,
    BETTER_AUTH_URL:
      environment.BETTER_AUTH_URL ?? CI_BUILD_ENVIRONMENT.BETTER_AUTH_URL,
    MONGODB_DATABASE_NAME:
      environment.MONGODB_DATABASE_NAME ??
      CI_BUILD_ENVIRONMENT.MONGODB_DATABASE_NAME,
    MONGODB_URI: environment.MONGODB_URI ?? CI_BUILD_ENVIRONMENT.MONGODB_URI,
  };
  const serverEnvironment = parseServerEnvironment({
    environment: ciBuildEnvironment,
  });

  return serverEnvironment;
}
