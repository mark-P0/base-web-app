# Authentication

This foundation uses Better Auth with the native MongoDB driver. It supports anonymous users, email and password accounts, and optional Google authentication.

## Configure the environment

Copy the variable names from `.env.example` to `.env.local`.

- Set `BETTER_AUTH_SECRET` to a private value with at least 32 characters. Run `bun lib/better-auth/secret.ts` to print one 256-bit base64url value. The command does not write a file.
- Set `BETTER_AUTH_URL` to the application origin, such as `http://localhost:3000`.
- Set `MONGODB_URI` to a MongoDB Atlas or replica-set connection string.
- Set `MONGODB_DATABASE_NAME` to the database name.
- Set both `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` to enable Google. Leave both values empty to disable Google. Partial Google configuration stops server initialization.

Never commit a secret. Configure production values through the deployment platform.

## Configure MongoDB

Better Auth uses transactions. Use MongoDB Atlas or another transaction-capable replica set. A standalone MongoDB server is not sufficient.

The application reuses one `MongoClient` per process. Better Auth manages its `user`, `session`, `account`, and `verification` collections and indexes. The application does not need an ORM, an ODM, or a schema migration for these collections.

## Configure Google

Create a Google OAuth client for each deployed origin. Register this authorized redirect URI:

```text
<BETTER_AUTH_URL>/api/auth/callback/google
```

The Better Auth catch-all Route Handler processes this callback. Do not add a separate callback route.

## Use authentication

Server code imports `auth` from `lib/better-auth/auth.ts`. Browser components import `authClient` from `lib/better-auth/auth-client.ts`. Development demonstrations are available under `/dev/auth` only in the development environment.

Protected server pages must call `auth.api.getSession()` with the request headers. They must not trust browser session state as an authorization check.

## Transfer guest data

Anonymous account linking calls `transferAnonymousUserData()` before Better Auth removes the guest. The base implementation is a no-op. A derived application must replace it when a guest can own application data.

Use atomic database operations where practical. The current hook does not promise one transaction across Better Auth collections and future application collections.

## Deferred features

This foundation does not implement email verification, password recovery, or password reset. A derived application must add these flows before its product requires them.

## Verify changes

Automated tests use fake authentication operations. They do not need MongoDB or Google. Run:

```bash
bun run lint
bun x tsc --noEmit
bun run test:unit
bun run test:integration
```

Do not use a production build as an agent work verification. Use a production build as a separate release check.
