# Agent Instructions

## Required project context

Before each task, read `README.md` completely. Treat the README as required project context. Follow its project purpose, technology stack, architecture, workflows, and feature requirements.

The README is the source for human-facing project knowledge. This file extends the README with mandatory agent behavior. Do not copy README content into this file.

If the README and this file conflict, report the conflict to the user and ask for direction.

## Always-on rules

> Agents must follow these rules at all times.

- Use ASD-STE100 Simplified Technical English. Use active voice, simple tenses, exact technical names, and one idea per sentence. Use the same word for the same idea. Do not use idioms, slang, or unnecessary jargon. Follow industry conventions and standards.
- For a question-only request, answer it. Do not modify files.
- Challenge instructions that conflict with sound engineering practice. Follow them if the user confirms the direction.

### Any source code change

- Before adding code, prefer: no change, existing project code, the standard library, native platform features, installed dependencies, then the smallest new implementation.
- Write readable code. Use clear names, sorted imports where practical, and avoid dense one-line code. Prefer assigning a return value to a variable before returning it.

- Functions: Prefer returning variables instead of expressions directly
    - Notable exceptions:
        - React JSX, effect cleanup functions, variant components
        - Function guard clauses, early returns
        - Map-like and enum-like functions whose main purpose is to return a known set of values
- Prefer NOT using unclear variable names, e.g. single characters, abbreviations
	- If unavoidable, they must have a clear, documented reason why
- Prefer NOT writing one-liners
	- Readability is preferred over concision and cleverness

- Do NOT use barrel exports
- Keep imports sorted
    - All import lines should be grouped together
- Keep files linted and formatted

#### Ponytail rules

<!-- Source: https://github.com/dietrichgebert/ponytail -->

The following is a modified list of "ponytail" rules.

When writing code, go through each of them, and STOP at the first item that holds true:

- Does this need to exist?    → no: skip it (YAGNI)
- Already in this codebase?   → reuse it, don't rewrite
- Stdlib present and does it? → use it
- Native platform feature?    → use it
- Installed dependency?       → use it
- Only then: the minimum that works

### Tests

- Treat the README test guidance as mandatory for source code changes.
- Do not add or use a different test runner.
- Follow the official documentation for the test tools named in the README.
- Write test files in TypeScript.

#### Work verifications

- Agents must NOT run a build to verify their work
    - This is mainly because agents are known to run into issues when trying to run a build
    - If a build is required to verify the work, ask the user to run it instead
- Similarly, agents must prefer NOT to run dev servers themselves
    - Prefer asking the user to start a dev server themselves, then resume the agent for checking whatever they need to check


## Conditional rules

> Agents must find all sub-sections and rule files related to their current task and follow the rules listed in them

Rule files are located in `.agents/rules/`. Read all relevant files before work:

- TypeScript change: `typescript.md`
- React component or hook change: `react.md` and `typescript.md`
- A requested plan: `plans.md`
- Git commit or pull request work: `git.md`

Keep these sub-sections and files as the detailed source of truth. Do not load unrelated rule files. If any sub-section grows too detailed, move it to a dedicated rule file and reference it in the list above.

### Databases

- For database writes, prefer atomic operations where practical.
    - e.g. `.findOneAndUpdate()` in MongoDB

### HTTP

- Use REST conventions as much as possible.
- Return the most appropriate HTTP status codes as much as possible.

### Next.js

- Prefer `redirect()` function during render whenever possible. Use `useRouter().replace()` only if redirect must happen in event handlers
- Prefer full `<Link />` components over `useRouter().push()`
- Prefer server-side logic as much as possible
- Files with `'use client'` directive should have a filename structure like `*.client.tsx`

####  This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.
