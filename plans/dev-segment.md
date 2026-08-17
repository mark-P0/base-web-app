# Development segment

## 1. Save plan copy — complete

- Save this plan at `plans/dev-segment.md`.
- Context: Next.js 16.3.1 App Router. No test runner exists.
- Model: gpt-5.6-luna. Effort: low.

## 2. Initialize `/dev`

- Add `app/dev/layout.tsx` as a Server Component.
- Call `notFound()` unless `NODE_ENV` is `development`.
- Render `children` in development mode.
- Add `app/dev/page.tsx` with only the page purpose.
- No navigation, preview pages, styling system, or dependencies.
- Model: gpt-5.6-luna. Effort: low.

## 3. Verify

- Run `bun run lint` and `bun run build`.
- User runs `bun dev`: `/dev` returns 200 and purpose text.
- User runs `bun start`: `/dev` returns 404.
- Do not add a test runner for this change.
- When a runner exists, add HTTP-level integration tests for development 200 and production 404.
- Model: gpt-5.6-luna. Effort: low.

## 4. Remove plan copy

- After all checks and user acceptance, remove `plans/dev-segment.md`.
- Model: gpt-5.6-luna. Effort: low.

## Unanswered questions

- None.
