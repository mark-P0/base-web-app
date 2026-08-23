# Shared shadcn UI usage

## Purpose

The `lib/shadcn` directory contains local source code for shared interface components. Import components from their files. Do not add a barrel export.

## Available modules

| Module | Purpose |
| --- | --- |
| `button.tsx` | Button variants, sizes, and polymorphic rendering |
| `input.tsx` | Text and form inputs |
| `label.tsx` | Form labels |
| `textarea.tsx` | Multiline text input |
| `utils.ts` | Tailwind class merging with `cn` |
| `styles.css` | Shared theme tokens and base styles |

## Imports

Use the configured path aliases:

```tsx
import { Button } from "@/lib/shadcn/button";
import { Input } from "@/lib/shadcn/input";
import { Label } from "@/lib/shadcn/label";
import { Textarea } from "@/lib/shadcn/textarea";
```

## Styling

The `components.json` file configures the `new-york` style, neutral base color, CSS variables, and Lucide icons.

The `lib/styles/tailwind.css` file imports `lib/shadcn/styles.css`. The root layout imports the Tailwind stylesheet once for all routes.

## Development preview

Start the development server. Open [`/dev/shadcn`](http://localhost:3000/dev/shadcn).

The page shows button variants, button sizes, icon buttons, disabled states, labels, inputs, validation state, and a textarea. The route is unavailable in production.

## Verification

Run these commands after a component change:

```bash
bun run lint
bunx tsc --noEmit --incremental false
bun run test:unit
bun run test:integration
```
