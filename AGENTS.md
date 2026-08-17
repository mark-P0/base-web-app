# Repository Instructions

## Default Rules

- Use ASD-STE100 Simplified Technical English. Use active voice, simple tenses, exact technical names, and one idea per sentence. Use the same word for the same idea. Do not use idioms, slang, or unnecessary jargon. Follow industry conventions and standards.
- For a question-only request, answer it. Do not modify files.
- Challenge instructions that conflict with sound engineering practice. Follow them if the user confirms the direction.
- Before adding code, prefer: no change, existing project code, the standard library, native platform features, installed dependencies, then the smallest new implementation.
- Write readable code. Use clear names, sorted imports where practical, and avoid dense one-line code. Prefer assigning a return value to a variable before returning it.
- Include focused unit or integration tests when practical.
- For database writes, prefer atomic operations where practical.
- Use REST conventions and appropriate HTTP status codes.

## Read Rules When Relevant

Read the named file in `.agents/rules/` before work in its domain:

| Task | Rule file |
| --- | --- |
| Any source-code change | `all-programming-languages.md` |
| TypeScript change | `typescript.md` |
| React component or hook change | `react.md` and `typescript.md` |
| Next.js routing or navigation | `next-js.md` and `react.md` |
| Verification that requires a dev server | `verifications.md` |
| A requested plan | `plans.md` |
| Git commit or pull request work | `git.md` |

Keep these files as the detailed source of truth. Do not load unrelated rule files.

## Next.js

- Prefer `redirect()` function during render whenever possible. Use `useRouter().replace()` only if redirect must happen in event handlers
- Prefer full `<Link />` components over `useRouter().push()`

###  This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.
