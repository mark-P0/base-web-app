# Next.js Root Handlers

## Status

- Stage 1: Complete.
- Stage 2: Complete.
- Stage 3: Complete.
- Stage 4: Complete.
- Next stage: Stage 5 — Remove the durable plan.
- Update this section at the end of each stage.

## Summary

Use `next-handlers` as the feature name. Add the four stable root handlers:

- `loading.tsx`: global streaming fallback.
- `not-found.tsx`: route-level and unmatched-route 404 UI.
- `error.tsx`: uncaught errors below the root layout.
- `global-error.tsx`: root layout errors.

Keep shared UI in `lib/next-handlers/`. Add real development triggers under `/dev/next-handlers/*`.

Defer experimental `global-not-found`, `unauthorized`, and `forbidden`. The project has one root layout and no authentication feature.

## Interfaces and behavior

- Use an accessible, responsive status-page shell with semantic theme tokens.
- Provide home navigation for 404 and error states.
- Provide `retry()` for error states. Show the safe error digest when available. Do not show error messages.
- Give `global-error.tsx` its own HTML document, styles, font setup, theme initialization script, and title.
- Use a generic root loading indicator. Future features can add specific segment skeletons.
- Add no dependencies or experimental Next.js flags.

Development routes:

- `/dev/next-handlers`: index and instructions.
- `/dev/next-handlers/not-found`: calls `notFound()`.
- `/dev/next-handlers/error`: throws during client rendering after user activation.
- `/dev/next-handlers/loading`: waits two seconds at request time. Its index link disables prefetch.
- `/dev/next-handlers/global-error`: uses a development-only root-layout trigger.
- Retry remounts each error trigger in its safe initial state.

## Implementation stages

### Stage 1 — Persist the plan

**Recommended model: GPT-5.6 Luna. Effort: low.**

- Copy this plan to `plans/next-handlers/PLAN.md`.
- Record stage status in that file.
- Stop for user review.

### Stage 2 — Add shared UI and production handlers

**Recommended model: GPT-5.6 Terra. Effort: medium.**

- Add shared status, loading, and client error components under `lib/next-handlers/`.
- Add the four root Next.js special files as thin routing adapters.
- Keep the required `'use client'` directives in `error.tsx` and `global-error.tsx`, despite the normal filename convention.
- Add integration tests for semantics, actions, retry behavior, safe digest display, and loading accessibility.
- Update the durable plan and stop for user review.

Completed: Added shared status, loading, and client error UI in
`lib/next-handlers/`. Added root special-file adapters and integration tests.
The global error document has standalone styles, a system font stack, theme
initialization, and a title. Error UI shows only a supplied digest, never an
error message.

Review update: Embedded conditional rendering uses Boolean `&&` expressions.
Global error styles now use a dedicated stylesheet and reuse
`/dark-mode-init.js`.

### Stage 3 — Add real development triggers

**Recommended model: GPT-5.6 Terra. Effort: medium.**

- Add the `/dev/next-handlers` index and four dedicated trigger routes.
- Use `connection()` and a two-second delay for repeatable loading tests.
- Add client render-error triggers for `error` and `global-error`.
- Mount the global trigger from the root layout only in development. Keep it inactive outside its exact preview route.
- Add tests for trigger activation and production guards.
- Update the durable plan and stop for user review.

Completed: Added the `/dev/next-handlers` preview index and four dedicated
routes. The loading route waits at request time with `connection()` and a
two-second delay. The error triggers throw during client rendering after user
activation. The global trigger is mounted by the root layout only in
development and runs only on its exact preview route. Environment checks are
kept in `lib/environment/`. Development preview UI and timing logic are kept
in `lib/next-handlers/`; route files are thin adapters. The loading preview
uses a full page navigation so its streaming fallback is visible. Unit tests
cover route isolation and development guards. An integration test covers
client trigger activation.

### Stage 4 — Document and verify

**Recommended model: GPT-5.6 Terra. Effort: medium.**

- Add `docs/next-handlers/usage.md` with handler scope, hierarchy, preview instructions, error-reporting guidance, and experimental-handler exclusions.
- Review all changes against repository, React, TypeScript, accessibility, and Next.js 16.3.1 rules.
- Run `bun run lint`, `bun run test:unit`, `bun run test:integration`, and `bun x tsc --noEmit`.
- Do not run a build or development server.
- Ask the user to run `bun dev` and verify all five development routes, retry recovery, navigation, responsive layout, and themes.
- Update the durable plan and stop for user review.

Completed: Added `docs/next-handlers/usage.md` with handler scope and
hierarchy, development preview instructions, safe error-reporting guidance,
and experimental-handler exclusions. Reviewed the feature against repository,
React, TypeScript, accessibility, and local Next.js 16.3.1 guidance. Formatted
the global error component to resolve an existing line-ending lint failure.
`bun run lint`, `bun run test:unit`, `bun run test:integration`, and
`bun x tsc --noEmit` pass. A build and development server were not run.

### Stage 5 — Remove the durable plan

**Recommended model: GPT-5.6 Luna. Effort: low.**

- Record completion, then remove `plans/next-handlers/PLAN.md`.
- Remove the empty task directory if applicable.
- Do not commit changes automatically.

## Assumptions

- The handlers use neutral base-application text and existing shadcn theme tokens.
- No monitoring service exists. Documentation identifies where to add error reporting later.
- `/dev` remains development-only through its existing layout guard.
- Each stage ends with a plan update and a stop for review.
- Unanswered questions: none.
