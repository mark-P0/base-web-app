# Authentication usage

## Supported behavior

The application uses Better Auth with the native MongoDB driver. It supports these authentication methods:

- Anonymous authentication
- Google authentication when both Google credentials are present
- Email and password authentication

Better Auth handles `GET` and `POST` requests under `/api/auth/[...all]`. The same handler processes the Google callback at `/api/auth/callback/google`.

The routes under `/dev/auth` provide development-only demonstrations and safe session diagnostics. They are not public product authentication pages. The development layout makes all `/dev` routes unavailable outside the development environment.

## Generate the authentication secret

Run this command from the repository root:

```bash
bun lib/better-auth/secret.ts
```

The command prints one 256-bit base64url value. Copy the value to `BETTER_AUTH_SECRET` in `.env.local` or the deployment environment. The command does not write a file.

Keep the value secret. Do not commit it, log it, or expose it through a `NEXT_PUBLIC_` variable. Use a different value for each independent deployment environment. Changing the value invalidates authentication data that depends on it.

## Configure environment variables

Copy `.env.example` to `.env.local`. Set these values:

| Variable | Requirement | Purpose |
| --- | --- | --- |
| `BETTER_AUTH_SECRET` | Required | Signs and protects Better Auth data. It must contain at least 32 characters. |
| `BETTER_AUTH_URL` | Required | Defines the public application URL, such as `http://localhost:3000`. |
| `MONGODB_URI` | Required | Connects the native MongoDB client to Atlas or a transaction-capable replica set. |
| `MONGODB_DATABASE_NAME` | Required | Selects the database that stores authentication data. |
| `GOOGLE_CLIENT_ID` | Optional pair | Identifies the Google OAuth web client. |
| `GOOGLE_CLIENT_SECRET` | Optional pair | Authenticates the Google OAuth web client. |

Set both Google variables or leave both variables empty. The application disables Google authentication when both variables are empty. Environment validation stops server startup when only one Google variable has a value.

All server environment access stays under `lib/environment/`. Server-only modules contain MongoDB values, Google credentials, and the Better Auth secret.

## Configure MongoDB

Use MongoDB Atlas or a self-managed replica set. A standalone MongoDB server does not support the multi-document transactions that this authentication configuration enables.

The example URI selects a local replica set:

```dotenv
MONGODB_URI=mongodb://localhost:27017/?replicaSet=rs0
```

The application creates one `MongoClient` for each process and reuses it. The Better Auth adapter receives this client and enables native-client transactions. The authentication configuration also enables MongoDB joins.

The MongoDB adapter does not need a schema migration. Better Auth uses these default collections:

| Collection | Data |
| --- | --- |
| `user` | User identity data. The anonymous plugin adds the optional `isAnonymous` field. |
| `session` | Session identifiers, expiry values, and request metadata. |
| `account` | Email credential records and linked Google provider records. Provider tokens can be present in this collection. |
| `verification` | Verification and reset tokens when an application enables those flows. |

MongoDB creates a collection when Better Auth first uses its model. The adapter creates the required indexes when it accesses that model. The anonymous plugin does not create a separate guest collection.

Restrict database access to the application. Treat the `account`, `session`, and `verification` collections as sensitive data. Do not return their private fields in diagnostics or logs.

## Configure Google

Create an OAuth 2.0 web client in Google Cloud. Register this exact authorized redirect URI for each environment:

```text
<BETTER_AUTH_URL>/api/auth/callback/google
```

For local development, the default URI is:

```text
http://localhost:3000/api/auth/callback/google
```

The scheme, host, port, path, case, and trailing slash must match the URI that Google receives. Register the production URI separately. Do not add a separate Next.js callback Route Handler.

## Transfer guest data

Anonymous users can own application data before they register. Better Auth cannot identify or transfer that application-owned data.

Replace the no-op `transferAnonymousUserData()` implementation in `lib/better-auth/transfer-anonymous-user-data.ts` when a derived application lets guests own data. The function receives the anonymous user ID and the new registered user ID.

The implementation must do these tasks:

1. Find all application records that use the anonymous user ID.
2. Move or reassign those records to the registered user ID.
3. Make retries safe where practical.
4. Throw an error when the transfer does not complete.
5. Test email sign-up, email sign-in, and Google upgrade flows.

Better Auth calls this function before it removes the linked guest. The current hook does not make future application-collection writes atomic with Better Auth writes. Design the derived application for partial failures and safe retries.

The **Delete guest and end session** action removes the anonymous user and its sessions. It does not run the transfer hook because no registered user receives the guest data. A derived application must define and implement deletion behavior for other guest-owned data.

## Deferred email features

This base enables email and password sign-up and sign-in. It keeps the Better Auth password defaults of 8 to 128 characters.

Email verification and password recovery are not included. A derived application must select a transactional email service, configure its sender functions, add result pages, and test token expiry before it enables these features. Review account enumeration behavior and session revocation when you add password recovery.

## Protect server content

Protect server content at the page, Route Handler, or Server Action that owns the data. The `/dev/auth/protected` page passes the request headers to `auth.api.getSession()` and disables the cookie cache for that read. It redirects signed-out requests during render.

Do not depend on client state for authorization. Do not use the development page as a public sign-in page.

## Deploy

Complete these tasks for each deployment environment:

1. Set all required environment variables in the deployment platform.
2. Use a unique production `BETTER_AUTH_SECRET`.
3. Set `BETTER_AUTH_URL` to the stable public HTTPS URL.
4. Allow the deployment network to reach MongoDB.
5. Use Atlas or another transaction-capable replica set.
6. Register the exact Google callback URI when Google authentication is available.
7. Use Node.js 20.19 or later for a Node.js deployment with MongoDB driver 7.
8. Confirm that deployment logs and monitoring do not record secrets, session tokens, provider tokens, or passwords.

Preview deployment URLs need separate configuration. Do not reuse a production callback URI for a different host.

## Automated verification

Run these commands without MongoDB or Google:

```bash
bun run lint
bun x tsc --noEmit
bun run test:unit
bun run test:integration
```

The automated authentication tests use fake operations. They do not connect to MongoDB or Google.

## Manual verification

Start the development server with a configured replica-set MongoDB deployment. Open [`/dev/auth`](http://localhost:3000/dev/auth).

Verify anonymous sign-in, guest deletion, email sign-up, email sign-in, Google sign-in, both guest upgrade methods, sign-out, and protected-page redirects. Confirm that session tokens and credentials do not appear in the rendered diagnostics.
