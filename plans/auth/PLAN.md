# Better Auth with MongoDB

## Summary

Add reusable Better Auth support for anonymous, Google, and email/password authentication. Use the native TypeScript MongoDB driver through the official adapter. Add focused development-only demonstrations, not public product pages.

## Interfaces and defaults

- API: `GET` and `POST` under `/api/auth/[...all]`.
- Server export: `auth`.
- Browser export: `authClient`, with the anonymous client plugin.
- Secret utility: `generateBetterAuthSecret(): string` in `lib/better-auth/secret.ts`.
- Secret command: `bun run auth:secret`; print one 256-bit base64url value. Never write an environment file.
- Required environment variables: `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `MONGODB_URI`, `MONGODB_DATABASE_NAME`.
- Optional pair: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`. Disable Google when both are absent. Reject partial configuration.
- Access all environment variables through modules under `lib/environment/`. Do not read `process.env` elsewhere.
- Google authorized redirect URI: `/api/auth/callback/google`. The catch-all auth handler processes it. Do not add a separate callback Route Handler.
- Development routes: `/dev/auth`, `/dev/auth/anonymous`, `/dev/auth/google`, `/dev/auth/email`, and `/dev/auth/protected`.
- `/dev/auth` shows the active session, session actions, method links, and safe diagnostics.
- Extension point: `transferAnonymousUserData({ anonymousUserId, newUserId })`.
- Enable MongoDB joins and native-client transactions.
- Keep Better Auth password and session defaults.
- Exclude email verification, password recovery, public auth pages, global route protection, ORMs, and ODMs.
- Require MongoDB Atlas or a replica set. Reuse one `MongoClient` per process.

## Stage completion protocol

Apply this protocol after every stage, including audit and plan removal:

1. Agent implements only the current stage, updates this plan with durable context, runs focused checks, then stops.
2. User reviews and creates one Conventional Commit for the stage. Agent does not create or amend commits.
3. User resumes the agent. Agent runs, in order: `bun run format`, `bun run lint`, `bun x tsc --noEmit`, `bun run test:unit`, `bun run test:integration`.
4. If formatting or fixes change files coherently related to the stage, agent leaves them ready and asks the user to amend the stage commit. Repeat checks after amendment.
5. If changes are incoherent with the stage, agent leaves them uncommitted and reports them for user review.
6. Do not run a production build. User or CI performs build verification separately.

## Current state

- Completed through: Stage 2.
- Stage 1 result: durable scope, interfaces, stages, checks, and assumptions recorded.
- Stage 2 result: exact Better Auth, MongoDB adapter, native MongoDB driver, and `server-only` dependencies installed.
- Better Auth includes other database adapters and Kysely transitively. Application code must use only the MongoDB adapter and native MongoDB driver.
- Next: add the Stage 3 Better Auth secret utility and tests.

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
- Support direct Bun execution. Print only the generated value to standard output.
- Add `bun run auth:secret` to `package.json`.
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
- Add sign-out for permanent users and **Delete guest and end session** for anonymous users.
- Add shared development navigation, session UI, pending state, status, and sanitized error components.
- Test signed-out, anonymous, permanent, pending, success, and error states with fake auth operations.

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

- `bun run auth:secret` prints one valid 256-bit base64url secret and changes no file.
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
- No secret or authentication token enters browser output or logs.
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
