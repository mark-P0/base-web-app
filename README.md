# Base Web App

`base-web-app` is the common starting point for future web applications. It provides a consistent project structure, development tools, reusable application features, and instructions for agentic development.

The current application stack uses Next.js, React, TypeScript, Tailwind CSS, and Bun. Better Auth uses the native MongoDB driver for persistent authentication data.

## Purpose

Use this repository as a base when you start a new web application. Each derived project can focus on its product features while it keeps the same foundation for code organization, testing, diagnostics, and agent collaboration.

This repository is also a place to improve that shared foundation. Add a feature here only when it is useful across multiple applications. Add product-specific work to the derived project instead.

## Included foundation

- Next.js App Router with React and TypeScript
- Tailwind CSS and reusable shadcn-based UI primitives
- Dark mode support with a development preview and tests
- Better Auth support for anonymous, Google, and email/password authentication
- Native MongoDB authentication storage with transactions and process-level client reuse
- Standard Next.js loading, error, global error, and not-found handlers
- Development-only pages for visual previews and diagnostics
- Biome for linting and formatting
- Bun for package management and tests
- Happy DOM support for integration tests
- Repository instructions for coding agents

## Requirements

- [Bun](https://bun.sh/) 1.3.14 or a compatible version

The repository records its Bun version in `package.json`.

## Get started

Install the dependencies:

```bash
bun install
```

Start the development server:

```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000).

Development previews are available under [http://localhost:3000/dev](http://localhost:3000/dev) while the application runs in the development environment.

## Environment variables

Authentication requires these server variables:

- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL`
- `MONGODB_URI`
- `MONGODB_DATABASE_NAME`

Google authentication also requires `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` as a complete pair. See the [authentication usage guide](docs/auth/usage.md) for setup and deployment instructions.

For all environment variables:

- Keep local values and secrets in `.env.local` at the repository root.
- Never commit secret values.
- Add the variable name to `.env.example` with an empty or safe example value.
- Document whether the variable is required and where the application uses it.
- Use the `NEXT_PUBLIC_` prefix only for values that are safe to expose to browsers. Next.js includes these values in the client bundle at build time.

Configure production values through the selected deployment platform. Keep `.env.example` current so that developers and coding agents can identify the required configuration without access to secrets.

## Available commands

| Command | Purpose |
| --- | --- |
| `bun run dev` | Start the Next.js development server. |
| `bun run build` | Create a production build. |
| `bun run start` | Start the production server after a build. |
| `bun run lint` | Check the repository with Biome. |
| `bun run format` | Format supported files with Biome. |
| `bun run test:unit` | Run unit tests with the Bun test runner. |
| `bun run test:integration` | Run integration tests with the Bun test runner and Happy DOM. |

## Project structure

```text
app/                  Next.js routes, layouts, metadata, and framework handlers
app/dev/              Development-only preview and diagnostic routes
docs/                 Long-lived feature documentation
lib/                  Application features, shared UI, styles, and utilities
public/               Static files served by Next.js
tests/unit/           Unit tests
tests/integration/    Integration tests and their shared setup
.agents/rules/        Detailed instructions for coding agents
AGENTS.md             Repository-wide instructions for coding agents
```

## Feature development

Keep most feature code in a matching directory under `lib/`. Import the feature into `app/` where Next.js routes and framework integration need it.

Each feature must have a corresponding `/dev/<feature-name>` page with the applicable visual previews, demonstrations, and diagnostics. Add long-lived documentation under `docs/<feature-name>/`. Add applicable unit or integration tests under `tests/`.

## Start a new project from this base

1. Create a new repository or copy this repository without its Git history.
2. Change the package name and other project identity values.
3. Replace the root application metadata and home page content.
4. Add the environment variables and external services that the application needs.
5. Remove example features that the application will not use.
6. Keep shared improvements in sync with this base when they apply to other projects.

Before deployment, review at least these values:

- Project name and package metadata
- Page title, description, icons, and social metadata
- Home page content
- Environment variables and secrets
- Database configuration
- Deployment configuration
- License and repository links

## Agentic development

This repository is designed for work by humans and coding agents. `README.md` is the human guide to the project. `AGENTS.md` and the files under `.agents/rules/` contain mandatory instructions for coding agents.

When you request agent work, describe the required result, constraints, and acceptance criteria. Review the agent's file changes and verification results before you accept the work. Keep product decisions and durable feature behavior in human-readable documentation instead of relying on chat history.

## Testing and quality checks

Add unit tests for isolated logic. Add integration tests for behavior that needs rendering or significant setup. Use the Bun test runner for both test types.

Before you submit a change, run the applicable checks:

```bash
bun run lint
bun run test:unit
bun run test:integration
```

Run `bun run format` when files need formatting. Run a production build as a separate release or deployment check.

## Feature documentation

The current feature guides are:

- [Authentication](docs/auth/usage.md)
- [Dark mode](docs/dark-mode/usage.md)
- [Next.js handlers](docs/next-handlers/usage.md)
- [shadcn UI primitives](docs/shadcn/usage.md)

## Deployment

Next.js supports several deployment targets. Select a target that supports the application runtime and its required services. Configure MongoDB and other external services in the derived project when those services are required.
