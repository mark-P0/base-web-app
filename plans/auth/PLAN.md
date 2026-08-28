# Better Auth with MongoDB

## Summary

Add reusable Better Auth support for anonymous, Google, and email/password authentication. Use the native TypeScript MongoDB driver through the official adapter. Add focused development-only demonstrations, not public product pages.

## Interfaces and defaults

- API: `GET` and `POST` under `/api/auth/[...all]`.
- Server export: `auth`.
- Browser export: `authClient`, with the anonymous client plugin.
- Secret utility: `generateBetterAuthSecret(): string` in `lib/better-auth/secret.ts`.
- Secret command: `bun lib/better-auth/secret.ts`; print one 256-bit base64url value. Never write an environment file.
- Required environment variables: `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `MONGODB_URI`, `MONGODB_DATABASE_NAME`.
- Optional pair: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`. Disable Google when both are absent. Reject partial configuration.
- Access all environment variables through modules under `lib/environment/`. Do not read `process.env` elsewhere.
- Google authorized redirect URI: `/api/auth/callback/google`. The catch-all auth handler processes it. Do not add a separate callback Route Handler.
- Development routes: `/dev/auth`, `/dev/auth/anonymous`, `/dev/auth/google`, `/dev/auth/email`, and `/dev/auth/protected`.
- `/dev/auth` shows the active session, session actions, method links, and safe diagnostics.
- Extension point: `transferAnonymousUserData({ anonymousUserId, newUserId })`.
- Enable MongoDB joins and native-client transactions.
- Encrypt stored OAuth provider tokens.
- Store production rate-limit counters in MongoDB.
- Keep Better Auth password and session defaults.
- Exclude email verification, password recovery, public auth pages, global route protection, ORMs, and ODMs.
- Require MongoDB Atlas or a replica set. Reuse one `MongoClient` per process.
- All stages: declare functions in dependency order. Declare each function before its first use, including private helpers.

## Stage completion protocol

Apply this protocol after every stage, including audit and plan removal:

1. Agent implements only the current stage, updates this plan with durable context, runs focused checks, then stops.
2. User reviews and creates one Conventional Commit for the stage. Agent does not create or amend commits.
3. User resumes the agent. Agent runs, in order: `bun run format`, `bun run lint`, `bun x tsc --noEmit`, `bun run test:unit`, `bun run test:integration`.
4. If formatting or fixes change files coherently related to the stage, agent leaves them ready and asks the user to amend the stage commit. Repeat checks after amendment.
5. If changes are incoherent with the stage, agent leaves them uncommitted and reports them for user review.
6. Do not run a production build. User or CI performs build verification separately.

## Current state

- Completed through: Stage 12.
- Stage 1 result: durable scope, interfaces, stages, checks, and assumptions recorded.
- Stage 2 result: exact Better Auth, MongoDB adapter, native MongoDB driver, and `server-only` dependencies installed.
- Better Auth includes other database adapters and Kysely transitively. Application code must use only the MongoDB adapter and native MongoDB driver.
- Stage 3 result: `generateBetterAuthSecret()` and direct execution with Bun generate a 256-bit base64url value without changing files.
- Stage 4 result: `serverEnvironment` validates required server values and optional Google credentials. CI production builds use non-secret placeholders only for missing required values.
- Stage 4 result: `mongoClient` is cached on `globalThis`, and `database` selects `MONGODB_DATABASE_NAME` without opening a connection during module initialization.
- Stage 5 result: `auth` uses the native MongoDB adapter with client-backed transactions and joins. Email/password and anonymous auth are enabled. Google is present only for a complete credential pair.
- Stage 5 result: `transferAnonymousUserData()` runs before Better Auth removes a linked guest. Its base implementation is a documented no-op for derived applications to replace.
- Stage 5 result: the catch-all Route Handler exports `GET` and `POST`; it handles Google callbacks. The same-origin React `authClient` includes the anonymous client plugin.
- Stage 6 result: `/dev/auth` shows safe live session diagnostics and links to all authentication demonstrations and the protected page. An explicit safe mapping prevents session tokens and private fields from entering the rendered diagnostic model.
- Stage 6 result: registered users can sign out without removing their account. Anonymous users can delete the guest and end its session through the anonymous plugin endpoint.
- Stage 6 result: authentication development UI lives under `lib/auth/development/`. Better Auth integration code remains under `lib/better-auth/`.
- Stage 6 result: shared authentication development navigation, session details, actions, pending state, success status, and sanitized error components are ready for later method pages. Pending and failed session loads do not expose stale details or actions.
- Stage 7 result: `/dev/auth/anonymous` creates real anonymous sessions through `authClient.signIn.anonymous()` and explains creation, upgrade, data transfer, and guest deletion.
- Stage 7 result: any active session disables anonymous sign-in. Anonymous sessions link to the Google and email upgrade demonstrations.
- Stage 7 result: shared session details and actions include compact variants for method pages. Stage 7 tests use fake operations and need no MongoDB service.
- Stage 8 result: `/dev/auth/google` reports safe configured and unconfigured states and explains that partial Google credentials stop server startup. Credential values remain in the server-only environment module.
- Stage 8 result: Google sign-in and anonymous upgrade use the fixed `/dev/auth/google` return path. The page shows compact session details and actions and disables invalid or repeated sign-in attempts.
- Stage 8 result: Stage 8 integration tests inject fake Google redirect and session operations. They need no Google or MongoDB service.
- Stage 9 result: `/dev/auth/email` provides accessible email sign-up and sign-in forms. Native password constraints match Better Auth defaults of 8 to 128 characters.
- Stage 9 result: account creation upgrades an anonymous user. Email sign-in can link an anonymous user to an existing account. Both flows run the existing anonymous data-transfer hook.
- Stage 9 result: the page reuses compact session details and actions, explains excluded verification and recovery flows, and uses fake operations in focused integration tests.
- Stage 10 result: `/dev/auth/protected` is a Server Component that passes request headers to `auth.api.getSession()` and bypasses the cookie cache for database validation on every render.
- Stage 10 result: unauthenticated requests redirect to `/dev/auth`. Authenticated requests render only the existing safe session diagnostics. The page is the security boundary and no `proxy.ts` is present.
- Stage 10 result: focused integration tests use fake session reads and need no MongoDB service.
- Stage 11 result: `docs/auth/usage.md` documents secret generation, environment values, MongoDB replica-set and collection behavior, Google callback registration, deferred email features, guest-data transfer, protected content, and deployment configuration.
- Stage 11 result: the README and home page now describe the native MongoDB authentication integration. The Next.js handler guide no longer states that authentication is absent.
- Stage 11 result: cross-flow integration tests cover development navigation, shared fake-session changes, email and Google guest upgrades, guest deletion, and authentication-method isolation without MongoDB or Google.
- Stage 12 result: authentication code meets repository, TypeScript, React, Next.js, Better Auth, MongoDB, accessibility, and security conventions. Server-only boundaries, fixed redirects, secret handling, safe diagnostics, native-driver-only access, client reuse, joins, and transactions are confirmed.
- Stage 12 result: Better Auth encrypts stored OAuth provider tokens. Production rate-limit counters use atomic MongoDB operations and work across application processes. Deployment documentation requires platform-specific trusted client IP or proxy configuration.
- Stage 12 result: live replica-set verification passed anonymous, email, Google, guest deletion, both account upgrades, sign-out, callback, and database-validated protected-page flows. Rendered diagnostics exposed no session token.
- Stage 12 result: all `/dev` routes produce the Next.js not-found boundary and `noindex` marker in production. The root loading boundary causes the documented streamed HTTP `200` soft-404 response.
- Next: audit the whole codebase.

## Stages

### 1. Copy and refine the plan

**Model:** `gpt-5.6-luna` · **Effort:** low

- Keep this durable plan at `plans/auth/PLAN.md`.
- Record selected behavior, versions, stages, and completion protocol.
- Verify the plan file only.

### 2. Install dependencies

**Model:** `gpt-5.6-luna` · **Effort:** low

- Install exact versions: `better-auth@1.7.1`, `@better-auth/mongo-adapter@1.7.1`, `mongodb@7.5.0`, and `server-only@0.0.1`.
- Update `package.json` and `bun.lock` only.
- Verify with a frozen Bun install.

### 3. Add Better Auth secret generation

**Model:** `gpt-5.6-terra` · **Effort:** medium

- Add `lib/better-auth/secret.ts` with `generateBetterAuthSecret()`.
- Use the standard-library cryptographic random generator for 32 random bytes. Encode as base64url.
- Add concise JSDoc for entropy, format, intended environment variable, and safe handling.
- Support `bun lib/better-auth/secret.ts`. Print only the generated value with `console.log()`.
- Add TypeScript unit tests for format, decoded byte length, and independent results.

### 4. Add environment and MongoDB foundations

**Model:** `gpt-5.6-terra` · **Effort:** medium

- Add typed server-only environment access under `lib/environment/`.
- Enforce a minimum 32-character auth secret, valid absolute auth URL, required MongoDB values, and complete Google credential pairs.
- Add a process-reused native `MongoClient` and explicit database selection.
- Add safe CI build placeholders. Do not add credentials or connect during build.
- Update `.env.example`.
- Test valid, missing, malformed, and partial environment configuration.

### 5. Add the authentication backend

**Model:** `gpt-5.6-sol` · **Effort:** high

- Configure `betterAuth` with MongoDB transactions, joins, email/password, optional Google, and anonymous authentication.
- Add the documented anonymous data-transfer extension point. Keep it as a no-op until a derived app owns guest data.
- Mount the Next.js catch-all handler. Let it process the Google callback path.
- Add the same-origin browser client and anonymous client plugin.
- Keep environment, database, secret, and token data in server-only modules.

### 6. Add the auth development hub

**Model:** `gpt-5.6-terra` · **Effort:** medium

- Add `/dev/auth` under the existing development-only layout.
- Show active authentication state, user ID, name, email, verification state, anonymous state, and expiry. Never show tokens.
- Add links to all method pages and the protected page.
- Add sign-out for registered users and **Delete guest and end session** for anonymous users.
- Add shared development navigation, session UI, pending state, status, and sanitized error components.
- Test signed-out, anonymous, registered, pending, success, and error states with fake auth operations.

### 7. Add the anonymous development page

**Model:** `gpt-5.6-terra` · **Effort:** medium

- Add `/dev/auth/anonymous`.
- Demonstrate anonymous login and explain the guest lifecycle.
- Prevent a second anonymous login while a session is active.
- Link anonymous users to the Google and email upgrade demonstrations.
- Reuse the shared compact session state and action components.
- Add focused integration tests.

### 8. Add the Google development page

**Model:** `gpt-5.6-terra` · **Effort:** medium

- Add `/dev/auth/google`.
- Show configured, unconfigured, and partial-configuration behavior without exposing credentials.
- Demonstrate Google login and anonymous-to-Google upgrade.
- Return the OAuth callback to the Google development page.
- Reuse the shared compact session state and action components.
- Add focused integration tests with fake redirects and auth operations.

### 9. Add the email development page

**Model:** `gpt-5.6-terra` · **Effort:** medium

- Add `/dev/auth/email`.
- Demonstrate email sign-up, sign-in, sign-out, and anonymous-to-email upgrade.
- Add accessible labels and native constraints that match Better Auth password defaults.
- Explain that verification and recovery are out of scope.
- Reuse shared session, status, and error components.
- Add focused integration tests for validation and each action state.

### 10. Add protected-route behavior

**Model:** `gpt-5.6-terra` · **Effort:** medium

- Add `/dev/auth/protected` as a Server Component.
- Validate the full session with `auth.api.getSession()` and request headers.
- Redirect unauthenticated requests to `/dev/auth` during render.
- Show safe session information when authenticated.
- Do not add `proxy.ts`; the page remains the security boundary.
- Test authenticated and unauthenticated results.

### 11. Complete documentation and cross-flow tests

**Model:** `gpt-5.6-terra` · **Effort:** medium

- Add the auth usage guide and README references.
- Document the secret command, environment variables, Atlas or replica-set setup, Google redirect registration, collections, transactions, and deployment configuration.
- Document deferred email verification and password recovery.
- Document guest-data transfer requirements for derived apps.
- Update the home-page MongoDB description and its affected test.
- Test navigation, shared-session updates, anonymous upgrades, guest deletion, and method isolation.
- Keep automated tests independent of MongoDB and Google.

### 12. Review authentication security and conventions

**Model:** `gpt-5.6-sol` · **Effort:** high

- Review auth changes against repository, TypeScript, React, Next.js, Better Auth, MongoDB, accessibility, and security rules.
- Confirm server-only boundaries, fixed redirects, secret handling, safe diagnostics, native-driver-only access, client reuse, and transactions.
- Ask the user to start the development server with a replica-set MongoDB deployment.
- Manually verify all login, sign-out, guest deletion, account-upgrade, configuration, callback, and protected-route flows.
- Confirm `/dev` routes remain unavailable outside development.

### 13. Audit the whole codebase

**Model:** `gpt-5.6-sol` · **Effort:** high

- Audit the full repository, not only auth changes, against `README.md`, `AGENTS.md`, all applicable `.agents/rules/`, and established conventions.
- Inspect source, tests, configuration, workflows, documentation, imports, naming, server/client boundaries, and obsolete statements.
- Run repository-wide format, lint, typecheck, unit tests, and integration tests through the completion protocol.
- Fix small coherent findings in this stage.
- If findings need unrelated or substantial remediation, add dedicated stages before plan removal. Do not hide or combine incoherent changes.
- Require zero unresolved findings, or explicit user acceptance, before plan removal.

### 14. Remove the durable plan

**Model:** `gpt-5.6-luna` · **Effort:** low

- Remove `plans/auth/PLAN.md` after all stages and audits pass.
- Remove the empty plan directory when applicable.
- Apply the completion protocol and stop for final user review.

## Acceptance tests

- `bun lib/better-auth/secret.ts` prints one valid 256-bit base64url secret and changes no file.
- All environment reads occur under `lib/environment/`.
- All three authentication methods create valid MongoDB-backed sessions.
- Anonymous users can upgrade through email or Google.
- Missing Google credentials do not block other methods. Partial credentials fail clearly.
- Each auth method has a focused development page.
- `/dev/auth` shows the active session and links to all demonstrations.
- Protected content requires a database-validated session.
- Guest deletion removes the anonymous user and session.
- Automated tests need no external service.
- No ORM or ODM is a direct application dependency or is used by application code.
- Stored OAuth provider tokens are encrypted.
- Production rate limits use shared MongoDB counters.
- No secret or authentication token enters browser output or logs.
- `/dev` routes render the not-found boundary outside development.
- The whole-codebase audit has no unresolved findings unless the user accepts them.
- Existing repository checks pass.

## Assumptions

- MongoDB uses Atlas or a transaction-capable replica set.
- A Node.js deployment uses Node.js 20.19 or later for MongoDB driver 7.
- Better Auth manages its default collections and indexes. MongoDB needs no schema migration.
- Better Auth internal writes use adapter transactions. Guest-data transfer does not promise atomic updates across future application collections.
- Google is optional for local development but required when a derived application presents Google authentication.
- CI uses fake client behavior for tests and safe placeholders for build analysis.
- The user creates and amends commits because repository rules prohibit agents from doing so.

## Unanswered questions

- None.
